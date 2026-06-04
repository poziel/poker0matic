import type { FirebaseConfig } from '@/stores/config'

export const EXTERNAL_DOCK_SESSION_TTL_MS = 5 * 60 * 1000
export const EXTERNAL_DOCK_SESSION_HEARTBEAT_MS = 5000

export type ExternalDockSessionStatus = 'waiting' | 'connected' | 'expired' | 'closed'

export interface ExternalDockSession {
  token: string
  userId: string
  userName: string
  avatarStyle?: string
  avatarSeed?: string
  avatarBg?: string
  createdAt: number
  expiresAt: number
  claimedAt?: number | null
  lastSeenAt?: number | null
  status?: ExternalDockSessionStatus
}

export function createExternalDockSessionToken (): string {
  return crypto.randomUUID().replaceAll('-', '')
}

export function encodeFirebaseConfig (config: FirebaseConfig): string {
  return btoa(JSON.stringify(config))
}

export function buildExternalDockUrl (
  roomId: string,
  config: FirebaseConfig,
  dockSession?: string | null,
): string {
  const url = new URL(`${window.location.origin}${import.meta.env.BASE_URL}app/dock/${encodeURIComponent(roomId)}`)
  url.searchParams.set('config', encodeFirebaseConfig(config))
  if (dockSession) {
    url.searchParams.set('dockSession', dockSession)
  }
  return url.toString()
}

export function isExternalDockSessionExpired (session: ExternalDockSession, now = Date.now()): boolean {
  return session.status === 'expired' || session.status === 'closed' || session.expiresAt <= now
}
