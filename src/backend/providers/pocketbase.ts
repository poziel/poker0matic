import type { BackendClient, ConfigValidationStatus, PocketBaseBackendConfig } from '@/backend/types'
import type { RoomUser, RoundEditLock } from '@/types/room'
import { applyRoomUpdates, createInitialPayload, normalizePayload } from '@/backend/payload'
import { createPollingBackendSubscriptions } from '@/backend/polling'

const POCKETBASE_COLLECTION = 'poker_rooms'

type PocketBaseRecord = {
  id: string
  roomId: string
  payload: unknown
  updatedAt?: number
}

let cachedPocketBaseAuthKey: string | null = null
let cachedPocketBaseToken: string | null = null

function normalizeUrl (value: string): string {
  return value.replace(/\/$/, '')
}

function createAuthCacheKey (config: PocketBaseBackendConfig): string {
  return JSON.stringify(config.settings)
}

async function getAuthToken (config: PocketBaseBackendConfig): Promise<string> {
  const cacheKey = createAuthCacheKey(config)
  if (cachedPocketBaseAuthKey === cacheKey && cachedPocketBaseToken) {
    return cachedPocketBaseToken
  }

  const response = await fetch(`${normalizeUrl(config.settings.url)}/api/collections/_superusers/auth-with-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      identity: config.settings.email,
      password: config.settings.password,
    }),
  })

  if (!response.ok) {
    throw new Error(`PocketBase auth failed with ${response.status}.`)
  }

  const data = await response.json() as { token: string }
  cachedPocketBaseAuthKey = cacheKey
  cachedPocketBaseToken = data.token
  return data.token
}

async function fetchPocketBase (
  config: PocketBaseBackendConfig,
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const token = await getAuthToken(config)
  return fetch(`${normalizeUrl(config.settings.url)}${path}`, {
    ...init,
    headers: {
      'Authorization': token,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })
}

function escapeFilterValue (value: string): string {
  return value.replaceAll('\\', '\\\\').replaceAll('\'', String.raw`\'`)
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

async function readPocketBaseRecord (config: PocketBaseBackendConfig, roomId: string): Promise<PocketBaseRecord | null> {
  const filter = encodeURIComponent(`roomId = '${escapeFilterValue(roomId)}'`)
  const response = await fetchPocketBase(
    config,
    `/api/collections/${POCKETBASE_COLLECTION}/records?page=1&perPage=1&filter=${filter}`,
  )

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error(`PocketBase request failed with ${response.status}.`)
  }

  const data = await response.json() as { items?: PocketBaseRecord[] }
  return data.items?.[0] ?? null
}

async function createPocketBaseRecord (config: PocketBaseBackendConfig, roomId: string, payload: unknown): Promise<void> {
  const response = await fetchPocketBase(config, `/api/collections/${POCKETBASE_COLLECTION}/records`, {
    method: 'POST',
    body: JSON.stringify({
      roomId,
      payload,
      updatedAt: Date.now(),
    }),
  })

  if (!response.ok) {
    throw new Error(`PocketBase create failed with ${response.status}.`)
  }
}

async function writePocketBaseRecord (
  config: PocketBaseBackendConfig,
  recordId: string,
  payload: unknown,
): Promise<void> {
  const response = await fetchPocketBase(config, `/api/collections/${POCKETBASE_COLLECTION}/records/${recordId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      payload,
      updatedAt: Date.now(),
    }),
  })

  if (!response.ok) {
    throw new Error(`PocketBase update failed with ${response.status}.`)
  }
}

async function loadPayload (config: PocketBaseBackendConfig, roomId: string) {
  const record = await readPocketBaseRecord(config, roomId)
  return normalizePayload(record?.payload)
}

async function validatePocketBaseConfig (config: PocketBaseBackendConfig): Promise<ConfigValidationStatus> {
  try {
    await fetchPocketBase(config, `/api/collections/${POCKETBASE_COLLECTION}/records?page=1&perPage=1`)
    return 'valid'
  } catch {
    return 'unreachable'
  }
}

async function updatePayload (
  config: PocketBaseBackendConfig,
  roomId: string,
  updater: (payload: ReturnType<typeof normalizePayload>) => ReturnType<typeof normalizePayload>,
): Promise<void> {
  const existingRecord = await readPocketBaseRecord(config, roomId)
  if (!existingRecord) {
    throw new Error('PocketBase room record not found.')
  }

  const nextPayload = updater(normalizePayload(existingRecord.payload))
  await writePocketBaseRecord(config, existingRecord.id, nextPayload)
}

export function createPocketBaseBackendClient (config: PocketBaseBackendConfig): BackendClient {
  const subscriptions = createPollingBackendSubscriptions(roomId => loadPayload(config, roomId))

  return {
    provider: 'pocketbase',
    validateConfig: () => validatePocketBaseConfig(config),
    async roomExists (roomId) {
      return (await readPocketBaseRecord(config, roomId)) !== null
    },
    async createRoom (roomId, room, initialUser, userId) {
      await createPocketBaseRecord(config, roomId, createInitialPayload(room, initialUser, userId))
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

      await updatePayload(config, roomId, currentPayload => applyRoomUpdates(currentPayload, {
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

      await updatePayload(config, roomId, currentPayload => applyRoomUpdates(currentPayload, {
        roundEditLock: null,
        lastActivity: Date.now(),
      }))
      subscriptions.notifyRoomUpdated(roomId)
    },
  }
}
