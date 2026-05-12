import type { BackendRoomPayload } from '@/backend/payload'
import type { RoomHistoryEntry, RoomRecord, RoomUser } from '@/types/room'
import { normalizePayload, payloadHistoryToList } from '@/backend/payload'

type PayloadListener = {
  room: Set<(room: RoomRecord | null) => void>
  users: Set<(users: Record<string, RoomUser>) => void>
  history: Set<(history: RoomHistoryEntry[]) => void>
}

type RoomPollState = {
  lastSerialized: string | null
  lastPayload: BackendRoomPayload
  timer: ReturnType<typeof setInterval> | null
  listeners: PayloadListener
  inFlight: boolean
}

type LoadPayload = (roomId: string) => Promise<BackendRoomPayload | null>

function createEmptyListeners (): PayloadListener {
  return {
    room: new Set(),
    users: new Set(),
    history: new Set(),
  }
}

export function createPollingBackendSubscriptions (
  loadPayload: LoadPayload,
  intervalMs = 1000,
) {
  const states = new Map<string, RoomPollState>()

  function emitAll (listeners: PayloadListener, payload: BackendRoomPayload) {
    for (const listener of listeners.room) {
      listener(payload.room)
    }

    for (const listener of listeners.users) {
      listener(payload.users)
    }

    const historyList = payloadHistoryToList(payload)
    for (const listener of listeners.history) {
      listener(historyList)
    }
  }

  async function refreshRoom (roomId: string) {
    const state = states.get(roomId)
    if (!state || state.inFlight) {
      return
    }

    state.inFlight = true

    try {
      const payload = normalizePayload(await loadPayload(roomId))
      const serialized = JSON.stringify(payload)

      if (state.lastSerialized !== serialized) {
        state.lastSerialized = serialized
        state.lastPayload = payload
        emitAll(state.listeners, payload)
      }
    } catch {
      // Ignore transient polling errors and keep the last known state.
    } finally {
      state.inFlight = false
    }
  }

  function ensureState (roomId: string): RoomPollState {
    const existing = states.get(roomId)
    if (existing) {
      return existing
    }

    const state: RoomPollState = {
      lastSerialized: null,
      lastPayload: normalizePayload(null),
      timer: setInterval(() => {
        void refreshRoom(roomId)
      }, intervalMs),
      listeners: createEmptyListeners(),
      inFlight: false,
    }

    states.set(roomId, state)
    void refreshRoom(roomId)

    return state
  }

  function cleanupRoom (roomId: string) {
    const state = states.get(roomId)
    if (!state) {
      return
    }

    const hasListeners = state.listeners.room.size > 0
      || state.listeners.users.size > 0
      || state.listeners.history.size > 0

    if (hasListeners) {
      return
    }

    if (state.timer) {
      clearInterval(state.timer)
    }
    states.delete(roomId)
  }

  function subscribeRoom (roomId: string, callback: (room: RoomRecord | null) => void) {
    const state = ensureState(roomId)
    state.listeners.room.add(callback)
    callback(state.lastPayload.room)

    return () => {
      state.listeners.room.delete(callback)
      cleanupRoom(roomId)
    }
  }

  function subscribeUsers (roomId: string, callback: (users: Record<string, RoomUser>) => void) {
    const state = ensureState(roomId)
    state.listeners.users.add(callback)
    callback(state.lastPayload.users)

    return () => {
      state.listeners.users.delete(callback)
      cleanupRoom(roomId)
    }
  }

  function subscribeHistory (roomId: string, callback: (history: RoomHistoryEntry[]) => void) {
    const state = ensureState(roomId)
    state.listeners.history.add(callback)
    callback(payloadHistoryToList(state.lastPayload))

    return () => {
      state.listeners.history.delete(callback)
      cleanupRoom(roomId)
    }
  }

  function notifyRoomUpdated (roomId: string) {
    void refreshRoom(roomId)
  }

  return {
    subscribeRoom,
    subscribeUsers,
    subscribeHistory,
    notifyRoomUpdated,
  }
}
