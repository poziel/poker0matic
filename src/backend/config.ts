import type {
  AppwriteBackendSettings,
  BackendConfig,
  BackendProvider,
  BackendProviderDefinition,
  FirebaseBackendSettings,
  PocketBaseBackendSettings,
  SupabaseBackendSettings,
} from '@/backend/types'

export const BACKEND_PROVIDER_DEFINITIONS: BackendProviderDefinition[] = [
  {
    id: 'firebase',
    label: 'Firebase',
    shortDescription: 'Realtime Database',
    fields: [
      { key: 'apiKey', label: 'apiKey', type: 'password', hint: 'Firebase web app API key from Project settings.' },
      { key: 'authDomain', label: 'authDomain', hint: 'Usually looks like your-project.firebaseapp.com.' },
      { key: 'databaseUrl', label: 'databaseUrl', type: 'url', hint: 'Realtime Database URL ending in .firebaseio.com.' },
      { key: 'projectId', label: 'projectId', hint: 'Firebase project id.' },
      { key: 'storageBucket', label: 'storageBucket', hint: 'Storage bucket shown in the Firebase web config snippet.' },
      { key: 'messagingSenderId', label: 'messagingSenderId', hint: 'Messaging sender id from the Firebase web config snippet.' },
      { key: 'appId', label: 'appId', hint: 'Firebase web app id from the Firebase web config snippet.' },
    ],
  },
  {
    id: 'supabase',
    label: 'Supabase',
    shortDescription: 'Postgres + Realtime',
    fields: [
      { key: 'url', label: 'Project URL', type: 'url', hint: 'Example: https://abcd1234.supabase.co' },
      { key: 'anonKey', label: 'Anon key', type: 'password', hint: 'Public anon key from Project Settings -> API.' },
      { key: 'projectRef', label: 'Project ref', hint: 'The short project id used in your Supabase URL.' },
    ],
  },
  {
    id: 'pocketbase',
    label: 'PocketBase',
    shortDescription: 'Embedded realtime backend',
    fields: [
      { key: 'url', label: 'Server URL', type: 'url', hint: 'Example: http://127.0.0.1:8090' },
      { key: 'email', label: 'Admin email', hint: 'PocketBase superuser email.' },
      { key: 'password', label: 'Admin password', type: 'password', hint: 'PocketBase superuser password.' },
    ],
  },
  {
    id: 'appwrite',
    label: 'Appwrite',
    shortDescription: 'Databases + realtime',
    fields: [
      { key: 'endpoint', label: 'Endpoint', type: 'url', hint: 'Example: https://cloud.appwrite.io/v1' },
      { key: 'projectId', label: 'Project ID', hint: 'Appwrite project id.' },
      { key: 'apiKey', label: 'API key', type: 'password', hint: 'Appwrite API key with database and document access.' },
      { key: 'databaseId', label: 'Database ID', hint: 'Database id that stores Poker0matic room documents.' },
      { key: 'roomsCollectionId', label: 'Rooms collection ID', hint: 'Collection id used to store room payload documents.' },
    ],
  },
]

export const BACKEND_PROVIDER_LABELS: Record<BackendProvider, string> = Object.fromEntries(
  BACKEND_PROVIDER_DEFINITIONS.map(provider => [provider.id, provider.label]),
) as Record<BackendProvider, string>

export function getDefaultBackendSettings (provider: BackendProvider): BackendConfig['settings'] {
  switch (provider) {
    case 'firebase': {
      return {
        apiKey: '',
        authDomain: '',
        databaseUrl: '',
        projectId: '',
        storageBucket: '',
        messagingSenderId: '',
        appId: '',
      } satisfies FirebaseBackendSettings
    }
    case 'supabase': {
      return {
        url: '',
        anonKey: '',
        projectRef: '',
      } satisfies SupabaseBackendSettings
    }
    case 'pocketbase': {
      return {
        url: '',
        email: '',
        password: '',
      } satisfies PocketBaseBackendSettings
    }
    case 'appwrite': {
      return {
        endpoint: '',
        projectId: '',
        apiKey: '',
        databaseId: '',
        roomsCollectionId: '',
      } satisfies AppwriteBackendSettings
    }
  }
}

export function createEmptyBackendConfig (provider: BackendProvider = 'firebase'): BackendConfig {
  return {
    provider,
    settings: getDefaultBackendSettings(provider),
  } as BackendConfig
}

export function cloneBackendConfig (config: BackendConfig): BackendConfig {
  return {
    provider: config.provider,
    settings: { ...config.settings },
  } as BackendConfig
}

export function isBackendConfigComplete (config: BackendConfig | null): boolean {
  if (!config) {
    return false
  }
  return Object.values(config.settings).every(value => String(value ?? '').trim().length > 0)
}

export function encodeBackendConfig (config: BackendConfig): string {
  return btoa(JSON.stringify(config))
}

function isLegacyFirebaseConfig (value: unknown): value is FirebaseBackendSettings {
  if (!value || typeof value !== 'object') {
    return false
  }
  const candidate = value as Record<string, unknown>
  return typeof candidate.apiKey === 'string'
    && typeof candidate.authDomain === 'string'
    && typeof candidate.databaseUrl === 'string'
    && typeof candidate.projectId === 'string'
    && typeof candidate.storageBucket === 'string'
    && typeof candidate.messagingSenderId === 'string'
    && typeof candidate.appId === 'string'
}

function isKnownBackendProvider (value: unknown): value is BackendProvider {
  return typeof value === 'string'
    && BACKEND_PROVIDER_DEFINITIONS.some(provider => provider.id === value)
}

export function normalizeBackendConfig (value: unknown): BackendConfig | null {
  if (isLegacyFirebaseConfig(value)) {
    return {
      provider: 'firebase',
      settings: value,
    }
  }

  if (!value || typeof value !== 'object') {
    return null
  }
  const candidate = value as Record<string, unknown>

  if (!isKnownBackendProvider(candidate.provider)) {
    return null
  }
  if (!candidate.settings || typeof candidate.settings !== 'object') {
    return null
  }

  const defaults = getDefaultBackendSettings(candidate.provider)
  const normalizedSettings = { ...defaults, ...candidate.settings } as BackendConfig['settings']

  return {
    provider: candidate.provider,
    settings: normalizedSettings,
  } as BackendConfig
}

export function decodeBackendConfig (base64: string): BackendConfig | null {
  try {
    return normalizeBackendConfig(JSON.parse(atob(base64)))
  } catch {
    return null
  }
}

export function getBackendProviderDefinition (provider: BackendProvider): BackendProviderDefinition {
  return BACKEND_PROVIDER_DEFINITIONS.find(item => item.id === provider)!
}
