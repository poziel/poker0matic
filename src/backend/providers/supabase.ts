import type { BackendClient, ConfigValidationStatus, SupabaseBackendConfig } from '@/backend/types'
import type { RoomUser, RoundEditLock } from '@/types/room'
import { applyRoomUpdates, createInitialPayload, normalizePayload } from '@/backend/payload'
import { createPollingBackendSubscriptions } from '@/backend/polling'

const SUPABASE_TABLE = 'poker_rooms'

type SupabaseRow = {
  id: string
  payload: unknown
  updated_at?: number
}

function normalizeUrl (value: string): string {
  return value.replace(/\/$/, '')
}

function createHeaders (config: SupabaseBackendConfig): HeadersInit {
  return {
    'apikey': config.settings.anonKey,
    'Authorization': `Bearer ${config.settings.anonKey}`,
    'Content-Type': 'application/json',
  }
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

function createEndpoint (config: SupabaseBackendConfig, path: string): string {
  return `${normalizeUrl(config.settings.url)}/rest/v1/${path}`
}

async function readSupabaseRow (config: SupabaseBackendConfig, roomId: string): Promise<SupabaseRow | null> {
  const query = `id=eq.${encodeURIComponent(roomId)}&select=id,payload,updated_at&limit=1`
  const response = await fetch(createEndpoint(config, `${SUPABASE_TABLE}?${query}`), {
    headers: createHeaders(config),
  })

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error(`Supabase request failed with ${response.status}.`)
  }

  const rows = await response.json() as SupabaseRow[]
  return rows[0] ?? null
}

async function writeSupabaseRow (config: SupabaseBackendConfig, roomId: string, payload: unknown): Promise<void> {
  const response = await fetch(createEndpoint(config, `${SUPABASE_TABLE}?id=eq.${encodeURIComponent(roomId)}`), {
    method: 'PATCH',
    headers: {
      ...createHeaders(config),
      Prefer: 'return=representation',
    },
    body: JSON.stringify({
      payload,
      updated_at: Date.now(),
    }),
  })

  if (!response.ok) {
    throw new Error(`Supabase update failed with ${response.status}.`)
  }
}

async function createSupabaseRow (config: SupabaseBackendConfig, roomId: string, payload: unknown): Promise<void> {
  const response = await fetch(createEndpoint(config, SUPABASE_TABLE), {
    method: 'POST',
    headers: {
      ...createHeaders(config),
      Prefer: 'return=representation',
    },
    body: JSON.stringify({
      id: roomId,
      payload,
      updated_at: Date.now(),
    }),
  })

  if (!response.ok) {
    throw new Error(`Supabase create failed with ${response.status}.`)
  }
}

async function loadPayload (config: SupabaseBackendConfig, roomId: string) {
  const row = await readSupabaseRow(config, roomId)
  return normalizePayload(row?.payload)
}

async function validateSupabaseConfig (config: SupabaseBackendConfig): Promise<ConfigValidationStatus> {
  const response = await fetch(createEndpoint(config, `${SUPABASE_TABLE}?select=id&limit=1`), {
    headers: createHeaders(config),
  }).catch(() => null)

  if (!response) {
    return 'unreachable'
  }

  return response.ok ? 'valid' : 'unreachable'
}

async function updatePayload (
  config: SupabaseBackendConfig,
  roomId: string,
  updater: (payload: ReturnType<typeof normalizePayload>) => ReturnType<typeof normalizePayload>,
): Promise<void> {
  const currentPayload = await loadPayload(config, roomId)
  const nextPayload = updater(currentPayload)
  await writeSupabaseRow(config, roomId, nextPayload)
}

export function createSupabaseBackendClient (config: SupabaseBackendConfig): BackendClient {
  const subscriptions = createPollingBackendSubscriptions(roomId => loadPayload(config, roomId))

  return {
    provider: 'supabase',
    validateConfig: () => validateSupabaseConfig(config),
    async roomExists (roomId) {
      return (await readSupabaseRow(config, roomId)) !== null
    },
    async createRoom (roomId, room, initialUser, userId) {
      await createSupabaseRow(config, roomId, createInitialPayload(room, initialUser, userId))
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

      await writeSupabaseRow(config, roomId, applyRoomUpdates(payload, {
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

      await writeSupabaseRow(config, roomId, applyRoomUpdates(payload, {
        roundEditLock: null,
        lastActivity: Date.now(),
      }))
      subscriptions.notifyRoomUpdated(roomId)
    },
  }
}
