import type { RoomHistoryEntry, RoomRecord, RoomUser } from '@/types/room'

export interface BackendRoomPayload {
  room: RoomRecord | null
  users: Record<string, RoomUser>
  history: Record<string, RoomHistoryEntry>
}

export function createInitialPayload (
  room: RoomRecord,
  initialUser: RoomUser,
  userId: string,
): BackendRoomPayload {
  return {
    room,
    users: {
      [userId]: initialUser,
    },
    history: {},
  }
}

export function normalizePayload (value: unknown): BackendRoomPayload {
  const candidate = (value && typeof value === 'object') ? value as Record<string, unknown> : {}

  return {
    room: (candidate.room && typeof candidate.room === 'object')
      ? candidate.room as RoomRecord
      : null,
    users: (candidate.users && typeof candidate.users === 'object')
      ? candidate.users as Record<string, RoomUser>
      : {},
    history: (candidate.history && typeof candidate.history === 'object')
      ? candidate.history as Record<string, RoomHistoryEntry>
      : {},
  }
}

export function payloadHistoryToList (payload: BackendRoomPayload): RoomHistoryEntry[] {
  return Object.values(payload.history).toSorted((a, b) => a.round - b.round)
}

function deleteAtPath (target: Record<string, unknown>, path: string[]) {
  const [head, ...tail] = path
  if (!head) {
    return
  }

  if (tail.length === 0) {
    delete target[head]
    return
  }

  const next = target[head]
  if (!next || typeof next !== 'object') {
    return
  }

  deleteAtPath(next as Record<string, unknown>, tail)
}

function setAtPath (target: Record<string, unknown>, path: string[], value: unknown) {
  const [head, ...tail] = path
  if (!head) {
    return
  }

  if (tail.length === 0) {
    if (value === null) {
      delete target[head]
      return
    }

    target[head] = value
    return
  }

  const current = target[head]
  if (!current || typeof current !== 'object' || Array.isArray(current)) {
    target[head] = {}
  }

  setAtPath(target[head] as Record<string, unknown>, tail, value)
}

function resolveUpdatePath (key: string): string[] {
  if (key.startsWith('users/') || key.startsWith('history/')) {
    return key.split('/')
  }

  return ['room', ...key.split('/')]
}

export function applyRoomUpdates (
  payload: BackendRoomPayload,
  updates: Record<string, unknown>,
): BackendRoomPayload {
  const nextPayload = structuredClone(payload)

  for (const [key, value] of Object.entries(updates)) {
    const path = resolveUpdatePath(key)
    if (value === null) {
      deleteAtPath(nextPayload as unknown as Record<string, unknown>, path)
      continue
    }
    setAtPath(nextPayload as unknown as Record<string, unknown>, path, value)
  }

  return normalizePayload(nextPayload)
}
