import type { BackendClient, BackendConfig, ConfigValidationStatus } from '@/backend/types'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { createBackendClient, resetBackendRuntime } from '@/backend'
import { decodeBackendConfig, encodeBackendConfig, normalizeBackendConfig } from '@/backend/config'
import { DEFAULT_AVATAR_BG, DEFAULT_AVATAR_STYLE } from '@/utils/avatarStyles'

const CONFIG_KEY = 'poker_config'
const USER_ID_KEY = 'poker_user_id'
const USER_NAME_KEY = 'poker_user_name'
const RECENT_ROOMS_KEY = 'poker_recent_rooms'
const AVATAR_STYLE_KEY = 'poker_avatar_style'
const AVATAR_SEED_KEY = 'poker_avatar_seed'
const AVATAR_BG_KEY = 'poker_avatar_bg'
const VIEW_MODE_KEY = 'poker_view_mode'
const HISTORY_PANEL_KEY = 'poker_history_panel'
const MAX_RECENT_ROOMS = 5

export type ViewMode = 'table' | 'grid'

export interface RecentRoom {
  id: string
  name: string
  joinedAt: number
  /** Base64-encoded backend config used when this room was joined. */
  configBase64?: string
}

let backendClient: BackendClient | null = null
let backendClientKey: string | null = null

export const useConfigStore = defineStore('config', () => {
  const configFound = ref(false)
  const backendConfig = ref<BackendConfig | null>(null)
  const userId = ref<string | null>(null)
  const userName = ref('')
  const activeRoomId = ref<string | null>(null)
  const activeRoomName = ref<string | null>(null)
  const recentRooms = ref<RecentRoom[]>([])
  const avatarStyle = ref(localStorage.getItem(AVATAR_STYLE_KEY) ?? DEFAULT_AVATAR_STYLE)
  const avatarSeed = ref(localStorage.getItem(AVATAR_SEED_KEY) ?? '')
  const avatarBg = ref(localStorage.getItem(AVATAR_BG_KEY) ?? DEFAULT_AVATAR_BG)
  const viewMode = ref<ViewMode>((localStorage.getItem(VIEW_MODE_KEY) as ViewMode) ?? 'table')
  const historyPanelOpen = ref(localStorage.getItem(HISTORY_PANEL_KEY) === 'true')
  const configValidationStatus = ref<ConfigValidationStatus>('unknown')

  const backendProvider = computed(() => backendConfig.value?.provider ?? null)
  const encodedBackendConfig = computed(() => backendConfig.value ? encodeBackendConfig(backendConfig.value) : null)

  function setActiveRoom (id: string | null, name: string | null) {
    activeRoomId.value = id
    activeRoomName.value = name
  }

  function saveRecentRoom (id: string, name: string) {
    const configBase64 = localStorage.getItem(CONFIG_KEY) ?? undefined
    const filtered = recentRooms.value.filter(room => room.id !== id)
    recentRooms.value = [{ id, name, joinedAt: Date.now(), configBase64 }, ...filtered].slice(0, MAX_RECENT_ROOMS)
    localStorage.setItem(RECENT_ROOMS_KEY, JSON.stringify(recentRooms.value))
  }

  function removeRecentRoom (id: string) {
    recentRooms.value = recentRooms.value.filter(room => room.id !== id)
    localStorage.setItem(RECENT_ROOMS_KEY, JSON.stringify(recentRooms.value))
  }

  function updateRecentRoomName (id: string, name: string) {
    const room = recentRooms.value.find(entry => entry.id === id)
    if (!room || room.name === name) {
      return
    }
    room.name = name
    localStorage.setItem(RECENT_ROOMS_KEY, JSON.stringify(recentRooms.value))
  }

  function initializeConfig () {
    try {
      const rawRecentRooms = localStorage.getItem(RECENT_ROOMS_KEY)
      recentRooms.value = rawRecentRooms ? JSON.parse(rawRecentRooms) : []
    } catch {
      recentRooms.value = []
    }

    let potentialUserId = localStorage.getItem(USER_ID_KEY)
    if (!potentialUserId) {
      potentialUserId = crypto.randomUUID()
      localStorage.setItem(USER_ID_KEY, potentialUserId)
    }
    userId.value = potentialUserId
    userName.value = localStorage.getItem(USER_NAME_KEY) || ''

    const storedConfig = localStorage.getItem(CONFIG_KEY)
    if (!storedConfig) {
      configFound.value = false
      backendConfig.value = null
      return
    }

    const parsedConfig = decodeBackendConfig(storedConfig)
    configFound.value = !!parsedConfig
    backendConfig.value = parsedConfig
  }

  function saveBackendConfig (config: BackendConfig) {
    const normalized = normalizeBackendConfig(config)
    if (!normalized) {
      return
    }

    const configChanged = JSON.stringify(normalized) !== JSON.stringify(backendConfig.value)
    localStorage.setItem(CONFIG_KEY, encodeBackendConfig(normalized))
    backendConfig.value = normalized
    configFound.value = true
    activeRoomId.value = null
    activeRoomName.value = null
    backendClient = null
    backendClientKey = null
    resetBackendRuntime()

    if (configChanged) {
      configValidationStatus.value = 'unknown'
    }
  }

  function applyConfigFromBase64 (base64: string) {
    const parsed = decodeBackendConfig(base64)
    if (parsed) {
      saveBackendConfig(parsed)
    }
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

  function setViewMode (mode: ViewMode) {
    viewMode.value = mode
    localStorage.setItem(VIEW_MODE_KEY, mode)
  }

  function setHistoryPanelOpen (open: boolean) {
    historyPanelOpen.value = open
    localStorage.setItem(HISTORY_PANEL_KEY, open ? 'true' : 'false')
  }

  function getBackend (): BackendClient | null {
    if (!backendConfig.value) {
      return null
    }

    const clientKey = JSON.stringify(backendConfig.value)
    if (backendClient && backendClientKey === clientKey) {
      return backendClient
    }

    backendClient = createBackendClient(backendConfig.value)
    backendClientKey = clientKey
    return backendClient
  }

  return {
    initializeConfig,
    saveBackendConfig,
    applyConfigFromBase64,
    saveRecentRoom,
    setUserName,
    setActiveRoom,
    getBackend,
    configFound,
    configValidationStatus,
    setConfigValidationStatus,
    backendConfig,
    backendProvider,
    encodedBackendConfig,
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
    viewMode,
    setViewMode,
    historyPanelOpen,
    setHistoryPanelOpen,
  }
})
