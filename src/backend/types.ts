import type { RoomHistoryEntry, RoomRecord, RoomUser, RoundEditLock, VoteValue } from '@/types/room'

export type BackendProvider = 'firebase' | 'supabase' | 'pocketbase' | 'appwrite'
export type ConfigValidationStatus = 'unknown' | 'valid' | 'unreachable'

export interface FirebaseBackendSettings {
  apiKey: string
  authDomain: string
  databaseUrl: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
}

export interface SupabaseBackendSettings {
  url: string
  anonKey: string
  projectRef: string
}

export interface PocketBaseBackendSettings {
  url: string
  email: string
  password: string
}

export interface AppwriteBackendSettings {
  endpoint: string
  projectId: string
  apiKey: string
  databaseId: string
  roomsCollectionId: string
}

export interface FirebaseBackendConfig {
  provider: 'firebase'
  settings: FirebaseBackendSettings
}

export interface SupabaseBackendConfig {
  provider: 'supabase'
  settings: SupabaseBackendSettings
}

export interface PocketBaseBackendConfig {
  provider: 'pocketbase'
  settings: PocketBaseBackendSettings
}

export interface AppwriteBackendConfig {
  provider: 'appwrite'
  settings: AppwriteBackendSettings
}

export type BackendConfig
  = | FirebaseBackendConfig
    | SupabaseBackendConfig
    | PocketBaseBackendConfig
    | AppwriteBackendConfig

export interface BackendConfigField {
  key: string
  label: string
  type?: 'text' | 'password' | 'url'
  hint?: string
}

export interface BackendProviderDefinition {
  id: BackendProvider
  label: string
  shortDescription: string
  fields: BackendConfigField[]
}

export interface BackendClient {
  provider: BackendProvider
  validateConfig: (config: BackendConfig) => Promise<ConfigValidationStatus>
  roomExists: (roomId: string) => Promise<boolean>
  createRoom: (roomId: string, room: RoomRecord, initialUser: RoomUser, userId: string) => Promise<void>
  subscribeRoom: (roomId: string, callback: (room: RoomRecord | null) => void) => () => void
  subscribeUsers: (roomId: string, callback: (users: Record<string, RoomUser>) => void) => () => void
  subscribeHistory: (roomId: string, callback: (history: RoomHistoryEntry[]) => void) => () => void
  upsertUser: (roomId: string, userId: string, updates: Partial<Omit<RoomUser, 'vote'>> & { vote?: VoteValue | null }) => Promise<void>
  updateRoom: (roomId: string, updates: Record<string, unknown>) => Promise<void>
  acquireRoundEditLock: (roomId: string, lock: RoundEditLock) => Promise<boolean>
  releaseRoundEditLock: (roomId: string, userId: string) => Promise<void>
}
