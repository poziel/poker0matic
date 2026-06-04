export interface ExternalDockRoomContext {
  roomId: string | null
  roomName: string | null
  updatedAt: number
}

const STORAGE_PREFIX = 'poker_external_dock'

export const EXTERNAL_DOCK_CONTEXT_KEY = `${STORAGE_PREFIX}_context`
export const EXTERNAL_DOCK_HEARTBEAT_KEY = `${STORAGE_PREFIX}_heartbeat`
export const EXTERNAL_DOCK_COMMAND_KEY = `${STORAGE_PREFIX}_command`
export const EXTERNAL_DOCK_HEARTBEAT_TTL_MS = 3500

export function readExternalDockContext (): ExternalDockRoomContext {
  try {
    const raw = localStorage.getItem(EXTERNAL_DOCK_CONTEXT_KEY)
    if (!raw) {
      return emptyExternalDockContext()
    }

    const parsed = JSON.parse(raw) as Partial<ExternalDockRoomContext>
    return {
      roomId: typeof parsed.roomId === 'string' && parsed.roomId.trim() ? parsed.roomId : null,
      roomName: typeof parsed.roomName === 'string' && parsed.roomName.trim() ? parsed.roomName : null,
      updatedAt: typeof parsed.updatedAt === 'number' ? parsed.updatedAt : Date.now(),
    }
  } catch {
    return emptyExternalDockContext()
  }
}

export function writeExternalDockContext (roomId: string | null, roomName: string | null) {
  localStorage.setItem(EXTERNAL_DOCK_CONTEXT_KEY, JSON.stringify({
    roomId,
    roomName,
    updatedAt: Date.now(),
  } satisfies ExternalDockRoomContext))
}

export function emptyExternalDockContext (): ExternalDockRoomContext {
  return {
    roomId: null,
    roomName: null,
    updatedAt: Date.now(),
  }
}

export function writeExternalDockHeartbeat () {
  localStorage.setItem(EXTERNAL_DOCK_HEARTBEAT_KEY, String(Date.now()))
}

export function clearExternalDockHeartbeat () {
  localStorage.removeItem(EXTERNAL_DOCK_HEARTBEAT_KEY)
}

export function requestExternalDockClose () {
  localStorage.setItem(EXTERNAL_DOCK_COMMAND_KEY, JSON.stringify({
    command: 'close',
    requestedAt: Date.now(),
  }))
}

export function isExternalDockHeartbeatActive () {
  const raw = localStorage.getItem(EXTERNAL_DOCK_HEARTBEAT_KEY)
  const timestamp = raw ? Number(raw) : Number.NaN
  return Number.isFinite(timestamp) && Date.now() - timestamp < EXTERNAL_DOCK_HEARTBEAT_TTL_MS
}
