import type { FirebaseConfig } from '@/stores/config'
import { createClientId } from '@/utils/id'

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
  avatarSource?: 'dicebear' | 'custom'
  customAvatarUrl?: string | null
  customAvatarCrop?: {
    left: number
    top: number
    width: number
    height: number
  } | null
  createdAt: number
  expiresAt: number
  claimedAt?: number | null
  lastSeenAt?: number | null
  status?: ExternalDockSessionStatus
}

export function createExternalDockSessionToken (): string {
  return createClientId().replace(/-/g, '')
}

export function encodeFirebaseConfig (config: FirebaseConfig): string {
  return btoa(JSON.stringify(config))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

export function buildExternalDockUrl (
  roomId: string,
  config: FirebaseConfig,
  dockSession?: string | null,
): string {
  const url = new URL(`${import.meta.env.BASE_URL}app/dock/${encodeURIComponent(roomId)}`, window.location.origin)
  url.searchParams.set('config', encodeFirebaseConfig(config))
  if (dockSession) {
    url.searchParams.set('dockSession', dockSession)
  }
  return url.toString()
}

export function isExternalDockSessionExpired (session: ExternalDockSession, now = Date.now()): boolean {
  return session.status === 'expired' || session.status === 'closed' || session.expiresAt <= now
}
