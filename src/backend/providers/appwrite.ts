import type { AppwriteBackendConfig, BackendClient, ConfigValidationStatus } from '@/backend/types'
import type { RoomUser, RoundEditLock } from '@/types/room'
import { applyRoomUpdates, createInitialPayload, normalizePayload } from '@/backend/payload'
import { createPollingBackendSubscriptions } from '@/backend/polling'

type AppwriteDocument = {
  $id: string
  payload?: string
  updatedAt?: number
}

function normalizeUrl (value: string): string {
  return value.replace(/\/$/, '')
}

function createHeaders (config: AppwriteBackendConfig): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'X-Appwrite-Project': config.settings.projectId,
    'X-Appwrite-Key': config.settings.apiKey,
  }
}

function createDocumentsPath (config: AppwriteBackendConfig): string {
  return `${normalizeUrl(config.settings.endpoint)}/databases/${encodeURIComponent(config.settings.databaseId)}/collections/${encodeURIComponent(config.settings.roomsCollectionId)}/documents`
}

function mergeUser (
  existingUser: RoomUser,
  updates: Partial<Omit<RoomUser, 'vote'>> & { vote?: RoomUser['vote'] | null },
): RoomUser {
  const { vote, ...rest } = updates
  const nextUser: RoomUser = {
    ...existingUser,
    ...rest,
  }

  if (vote === null) {
    delete nextUser.vote
  } else if (vote !== undefined) {
    nextUser.vote = vote
  }

  return nextUser
}

async function fetchAppwriteDocument (config: AppwriteBackendConfig, roomId: string): Promise<AppwriteDocument | null> {
  const response = await fetch(`${createDocumentsPath(config)}/${encodeURIComponent(roomId)}`, {
    headers: createHeaders(config),
  })

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error(`Appwrite request failed with ${response.status}.`)
  }

  return await response.json() as AppwriteDocument
}

function decodePayload (document: AppwriteDocument | null) {
  if (!document?.payload) {
    return normalizePayload(null)
  }

  try {
    return normalizePayload(JSON.parse(document.payload))
  } catch {
    return normalizePayload(null)
  }
}

async function createAppwriteDocument (config: AppwriteBackendConfig, roomId: string, payload: unknown): Promise<void> {
  const response = await fetch(createDocumentsPath(config), {
    method: 'POST',
    headers: createHeaders(config),
    body: JSON.stringify({
      documentId: roomId,
      data: {
        payload: JSON.stringify(payload),
        updatedAt: Date.now(),
      },
      permissions: [],
    }),
  })

  if (!response.ok) {
    throw new Error(`Appwrite create failed with ${response.status}.`)
  }
}

async function updateAppwriteDocument (config: AppwriteBackendConfig, roomId: string, payload: unknown): Promise<void> {
  const response = await fetch(`${createDocumentsPath(config)}/${encodeURIComponent(roomId)}`, {
    method: 'PATCH',
    headers: createHeaders(config),
    body: JSON.stringify({
      data: {
        payload: JSON.stringify(payload),
        updatedAt: Date.now(),
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`Appwrite update failed with ${response.status}.`)
  }
}

async function loadPayload (config: AppwriteBackendConfig, roomId: string) {
  return decodePayload(await fetchAppwriteDocument(config, roomId))
}

async function validateAppwriteConfig (config: AppwriteBackendConfig): Promise<ConfigValidationStatus> {
  const response = await fetch(createDocumentsPath(config), {
    headers: createHeaders(config),
  }).catch(() => null)

  if (!response) {
    return 'unreachable'
  }

  return response.ok ? 'valid' : 'unreachable'
}

async function updatePayload (
  config: AppwriteBackendConfig,
  roomId: string,
  updater: (payload: ReturnType<typeof normalizePayload>) => ReturnType<typeof normalizePayload>,
): Promise<void> {
  const currentPayload = await loadPayload(config, roomId)
  const nextPayload = updater(currentPayload)
  await updateAppwriteDocument(config, roomId, nextPayload)
}

export function createAppwriteBackendClient (config: AppwriteBackendConfig): BackendClient {
  const subscriptions = createPollingBackendSubscriptions(roomId => loadPayload(config, roomId))

  return {
    provider: 'appwrite',
    validateConfig: () => validateAppwriteConfig(config),
    async roomExists (roomId) {
      return (await fetchAppwriteDocument(config, roomId)) !== null
    },
    async createRoom (roomId, room, initialUser, userId) {
      await createAppwriteDocument(config, roomId, createInitialPayload(room, initialUser, userId))
      subscriptions.notifyRoomUpdated(roomId)
    },
    subscribeRoom: subscriptions.subscribeRoom,
    subscribeUsers: subscriptions.subscribeUsers,
    subscribeHistory: subscriptions.subscribeHistory,
    async upsertUser (roomId, userId, updates) {
      await updatePayload(config, roomId, payload => {
        const existingUser = payload.users[userId] ?? { name: 'Anonymous', joinedAt: Date.now() } satisfies RoomUser
        return {
          ...payload,
          users: {
            ...payload.users,
            [userId]: mergeUser(existingUser, updates),
          },
        }
      })
      subscriptions.notifyRoomUpdated(roomId)
    },
    async updateRoom (roomId, updates) {
      await updatePayload(config, roomId, payload => applyRoomUpdates(payload, updates))
      subscriptions.notifyRoomUpdated(roomId)
    },
    async acquireRoundEditLock (roomId, lock) {
      const payload = await loadPayload(config, roomId)
      const currentLock = payload.room?.roundEditLock as RoundEditLock | null | undefined
      if (currentLock && currentLock.userId !== lock.userId) {
        return false
      }

      await updateAppwriteDocument(config, roomId, applyRoomUpdates(payload, {
        roundEditLock: lock,
        lastActivity: Date.now(),
      }))
      subscriptions.notifyRoomUpdated(roomId)
      return true
    },
    async releaseRoundEditLock (roomId, userId) {
      const payload = await loadPayload(config, roomId)
      if (payload.room?.roundEditLock?.userId !== userId) {
        return
      }

      await updateAppwriteDocument(config, roomId, applyRoomUpdates(payload, {
        roundEditLock: null,
        lastActivity: Date.now(),
      }))
      subscriptions.notifyRoomUpdated(roomId)
    },
  }
}
