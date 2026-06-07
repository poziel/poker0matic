import { deleteApp, getApp, getApps, initializeApp } from 'firebase/app'
import { type Database, getDatabase } from 'firebase/database'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { type AvatarCrop, type AvatarSource, DEFAULT_AVATAR_BG, DEFAULT_AVATAR_SOURCE, DEFAULT_AVATAR_STYLE, normalizeAvatarCrop } from '@/utils/avatarStyles'
import { createClientId } from '@/utils/id'

export interface FirebaseConfig {
  apiKey: string
  authDomain: string
  databaseUrl: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
}

const CONFIG_KEY = 'refinimo_config'
const USER_ID_KEY = 'refinimo_user_id'
const USER_NAME_KEY = 'refinimo_user_name'
const RECENT_ROOMS_KEY = 'refinimo_recent_rooms'
const AVATAR_STYLE_KEY = 'refinimo_avatar_style'
const AVATAR_SEED_KEY = 'refinimo_avatar_seed'
const AVATAR_BG_KEY = 'refinimo_avatar_bg'
const AVATAR_SOURCE_KEY = 'refinimo_avatar_source'
const GRAVATAR_EMAIL_KEY = 'refinimo_gravatar_email'
const CUSTOM_AVATAR_URL_KEY = 'refinimo_custom_avatar_url'
const CUSTOM_AVATAR_CROP_KEY = 'refinimo_custom_avatar_crop'
const VIEW_MODE_KEY = 'refinimo_view_mode'
const HISTORY_PANEL_KEY = 'refinimo_history_panel'
const ENABLE_ADS_KEY = 'refinimo_enable_ads'
const LEGACY_STORAGE_PREFIX = 'poker_'
const MAX_RECENT_ROOMS = 5

export type ViewMode = 'table' | 'grid'
export type ConfigValidationStatus = 'unknown' | 'valid' | 'unreachable'

export interface RecentRoom {
  id: string
  name: string
  joinedAt: number
  /** Base64-encoded FirebaseConfig used when this room was joined. */
  configBase64?: string
}

let _db: Database | null = null

function readStoredValue (key: string): string | null {
  const current = localStorage.getItem(key)
  if (current !== null) {
    return current
  }

  const legacyKey = key.replace(/^refinimo_/, LEGACY_STORAGE_PREFIX)
  const legacy = localStorage.getItem(legacyKey)
  if (legacy !== null) {
    localStorage.setItem(key, legacy)
  }
  return legacy
}

export const useConfigStore = defineStore('config', () => {
  const configFound = ref(false)
  const firebaseConfig = ref<FirebaseConfig | null>(null)
  const userId = ref<string | null>(null)
  const userName = ref('')
  const activeRoomId = ref<string | null>(null)
  const activeRoomName = ref<string | null>(null)
  const recentRooms = ref<RecentRoom[]>([])
  const avatarStyle = ref(readStoredValue(AVATAR_STYLE_KEY) ?? DEFAULT_AVATAR_STYLE)
  const avatarSeed = ref(readStoredValue(AVATAR_SEED_KEY) ?? '')
  const avatarBg = ref(readStoredValue(AVATAR_BG_KEY) ?? DEFAULT_AVATAR_BG)
  const avatarSource = ref<AvatarSource>(normalizeAvatarSource(readStoredValue(AVATAR_SOURCE_KEY)))
  const gravatarEmail = ref(readStoredValue(GRAVATAR_EMAIL_KEY) ?? '')
  const customAvatarUrl = ref(readStoredValue(CUSTOM_AVATAR_URL_KEY) ?? '')
  const customAvatarCrop = ref<AvatarCrop | null>(readStoredAvatarCrop())
  const viewMode = ref<ViewMode>((readStoredValue(VIEW_MODE_KEY) as ViewMode) ?? 'table')
  const historyPanelOpen = ref(readStoredValue(HISTORY_PANEL_KEY) === 'true')
  const enableAds = ref(readStoredValue(ENABLE_ADS_KEY) === 'true')

  // Cached validation result — reset to 'unknown' when config changes so the
  // lobby re-checks; stays valid across page navigations for the same config.
  const configValidationStatus = ref<ConfigValidationStatus>('unknown')

  function setActiveRoom (id: string | null, name: string | null) {
    activeRoomId.value = id
    activeRoomName.value = name
  }

  function saveRecentRoom (id: string, name: string) {
    const configBase64 = localStorage.getItem(CONFIG_KEY) ?? undefined
    const filtered = recentRooms.value.filter(r => r.id !== id)
    recentRooms.value = [{ id, name, joinedAt: Date.now(), configBase64 }, ...filtered].slice(0, MAX_RECENT_ROOMS)
    localStorage.setItem(RECENT_ROOMS_KEY, JSON.stringify(recentRooms.value))
  }

  function removeRecentRoom (id: string) {
    recentRooms.value = recentRooms.value.filter(r => r.id !== id)
    localStorage.setItem(RECENT_ROOMS_KEY, JSON.stringify(recentRooms.value))
  }

  function updateRecentRoomName (id: string, name: string) {
    const room = recentRooms.value.find(r => r.id === id)
    if (room && room.name !== name) {
      room.name = name
      localStorage.setItem(RECENT_ROOMS_KEY, JSON.stringify(recentRooms.value))
    }
  }

  function initializeConfig () {
    try {
      const raw = readStoredValue(RECENT_ROOMS_KEY)
      recentRooms.value = raw ? JSON.parse(raw) : []
    } catch {
      recentRooms.value = []
    }

    let potentialUserId = readStoredValue(USER_ID_KEY)
    if (!potentialUserId) {
      potentialUserId = createClientId()
      localStorage.setItem(USER_ID_KEY, potentialUserId)
    }
    userId.value = potentialUserId
    userName.value = readStoredValue(USER_NAME_KEY) || ''

    const config = readStoredValue(CONFIG_KEY)
    if (!config) {
      configFound.value = false
      return
    }

    try {
      const rawConfig = atob(config)
      const parsedConfig = JSON.parse(rawConfig)
      configFound.value = !!parsedConfig
      firebaseConfig.value = parsedConfig || null
    } catch (error) {
      console.error('Error parsing config:', error)
      configFound.value = false
    }
  }

  function saveFirebaseConfig (config: FirebaseConfig) {
    try {
      const staleApps = [...getApps()]
      const configChanged = JSON.stringify(config) !== JSON.stringify(firebaseConfig.value)

      localStorage.setItem(CONFIG_KEY, btoa(JSON.stringify(config)))
      firebaseConfig.value = config
      configFound.value = true
      activeRoomId.value = null
      activeRoomName.value = null
      _db = null

      if (configChanged) {
        configValidationStatus.value = 'unknown'
      }

      for (const app of staleApps) {
        deleteApp(app).catch(() => {})
      }
    } catch (error) {
      console.error('Error saving config:', error)
    }
  }

  /**
   * Apply a config from a base64 string (e.g. from a URL query param).
   * Reuses saveFirebaseConfig so old apps are torn down and validation is reset.
   */
  function applyConfigFromBase64 (base64: string) {
    try {
      const normalizedBase64 = normalizeBase64Config(base64)
      const parsed: FirebaseConfig = JSON.parse(atob(normalizedBase64))
      if (parsed) {
        saveFirebaseConfig(parsed)
      }
    } catch {
      // malformed base64 — silently ignore
    }
  }

  function normalizeBase64Config (base64: string): string {
    const withoutWhitespace = base64.trim().replace(/\s/g, '')
    const standardBase64 = withoutWhitespace.replace(/-/g, '+').replace(/_/g, '/')
    const paddingLength = (4 - (standardBase64.length % 4)) % 4
    return `${standardBase64}${'='.repeat(paddingLength)}`
  }

  function setConfigValidationStatus (status: ConfigValidationStatus) {
    configValidationStatus.value = status
  }

  function setUserName (name: string) {
    userName.value = name
    localStorage.setItem(USER_NAME_KEY, name)
  }

  function setAvatarStyle (style: string) {
    avatarStyle.value = style
    localStorage.setItem(AVATAR_STYLE_KEY, style)
  }

  function setAvatarSeed (seed: string) {
    avatarSeed.value = seed
    if (seed) {
      localStorage.setItem(AVATAR_SEED_KEY, seed)
    } else {
      localStorage.removeItem(AVATAR_SEED_KEY)
    }
  }

  function setAvatarBg (bg: string) {
    avatarBg.value = bg || DEFAULT_AVATAR_BG
    localStorage.setItem(AVATAR_BG_KEY, avatarBg.value)
  }

  function setAvatarSource (source: AvatarSource) {
    avatarSource.value = normalizeAvatarSource(source)
    localStorage.setItem(AVATAR_SOURCE_KEY, avatarSource.value)
  }

  function setGravatarEmail (email: string) {
    gravatarEmail.value = email.trim()
    if (gravatarEmail.value) {
      localStorage.setItem(GRAVATAR_EMAIL_KEY, gravatarEmail.value)
    } else {
      localStorage.removeItem(GRAVATAR_EMAIL_KEY)
    }
  }

  function setCustomAvatarUrl (url: string) {
    customAvatarUrl.value = url.trim()
    if (customAvatarUrl.value) {
      localStorage.setItem(CUSTOM_AVATAR_URL_KEY, customAvatarUrl.value)
    } else {
      localStorage.removeItem(CUSTOM_AVATAR_URL_KEY)
    }
  }

  function setCustomAvatarCrop (crop: AvatarCrop | null) {
    customAvatarCrop.value = normalizeAvatarCrop(crop)
    if (customAvatarCrop.value) {
      localStorage.setItem(CUSTOM_AVATAR_CROP_KEY, JSON.stringify(customAvatarCrop.value))
    } else {
      localStorage.removeItem(CUSTOM_AVATAR_CROP_KEY)
    }
  }

  function normalizeAvatarSource (source: string | null | undefined): AvatarSource {
    if (source === 'custom' || source === 'gravatar') {
      return source
    }

    return DEFAULT_AVATAR_SOURCE
  }

  function readStoredAvatarCrop (): AvatarCrop | null {
    try {
      const raw = readStoredValue(CUSTOM_AVATAR_CROP_KEY)
      return raw ? normalizeAvatarCrop(JSON.parse(raw) as AvatarCrop) : null
    } catch {
      return null
    }
  }

  function setViewMode (mode: ViewMode) {
    viewMode.value = mode
    localStorage.setItem(VIEW_MODE_KEY, mode)
  }

  function setHistoryPanelOpen (open: boolean) {
    historyPanelOpen.value = open
    localStorage.setItem(HISTORY_PANEL_KEY, open ? 'true' : 'false')
  }

  function setEnableAds (enabled: boolean) {
    enableAds.value = enabled
    localStorage.setItem(ENABLE_ADS_KEY, enabled ? 'true' : 'false')
  }

  function getDb (): Database | null {
    if (_db) {
      return _db
    }
    if (!firebaseConfig.value) {
      return null
    }
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig.value)
    _db = getDatabase(app)
    return _db
  }

  return {
    initializeConfig,
    saveFirebaseConfig,
    applyConfigFromBase64,
    saveRecentRoom,
    setUserName,
    setActiveRoom,
    getDb,
    configFound,
    configValidationStatus,
    setConfigValidationStatus,
    firebaseConfig,
    userId,
    userName,
    activeRoomId,
    activeRoomName,
    recentRooms,
    removeRecentRoom,
    updateRecentRoomName,
    avatarStyle,
    setAvatarStyle,
    avatarSeed,
    setAvatarSeed,
    avatarBg,
    setAvatarBg,
    avatarSource,
    setAvatarSource,
    gravatarEmail,
    setGravatarEmail,
    customAvatarUrl,
    setCustomAvatarUrl,
    customAvatarCrop,
    setCustomAvatarCrop,
    viewMode,
    setViewMode,
    historyPanelOpen,
    setHistoryPanelOpen,
    enableAds,
    setEnableAds,
  }
})
