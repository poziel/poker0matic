import { defineStore } from 'pinia'
import { ref } from 'vue'
import vuetify from '@/plugins/vuetify'
import { DEFAULT_THEME_ID, THEME_IDS, type ThemeId } from '@/utils/themes'

const THEME_KEY = 'poker_theme'

export const useAppStore = defineStore('app', () => {
  const roomName = ref('')
  const playerCount = ref(0)
  const currentRoomId = ref<string | null>(null)
  const roomPresenceActive = ref(false)
  const roomHasActiveVote = ref(false)
  const configModalOpen = ref(false)

  const saved = localStorage.getItem(THEME_KEY) as ThemeId | null
  const initial: ThemeId = saved && THEME_IDS.includes(saved) ? saved : DEFAULT_THEME_ID
  const currentTheme = ref<ThemeId>(initial)
  applyTheme(initial)

  // -- toast --------------------------------------------------------------
  const toastMessage = ref('')
  const toastType = ref<'success' | 'error'>('success')
  const toastVisible = ref(false)
  let _toastTimer: ReturnType<typeof setTimeout> | null = null

  function showToast (message: string, type: 'success' | 'error' = 'success', duration = 3500) {
    if (_toastTimer) {
      clearTimeout(_toastTimer)
    }
    toastMessage.value = message
    toastType.value = type
    toastVisible.value = true
    _toastTimer = setTimeout(() => {
      toastVisible.value = false
    }, duration)
  }

  // -- room ---------------------------------------------------------------
  function setRoomInfo (
    id: string | null,
    name: string,
    count: number,
    presenceActive = false,
    hasActiveVote = false,
  ) {
    currentRoomId.value = id
    roomName.value = name
    playerCount.value = count
    roomPresenceActive.value = presenceActive
    roomHasActiveVote.value = hasActiveVote
  }

  function setConfigModalOpen (open: boolean) {
    configModalOpen.value = open
  }

  // -- theme --------------------------------------------------------------
  function applyTheme (theme: ThemeId) {
    document.documentElement.dataset.theme = theme
    vuetify.theme.global.name.value = theme
  }

  function setTheme (theme: ThemeId) {
    currentTheme.value = theme
    applyTheme(theme)
    localStorage.setItem(THEME_KEY, theme)
  }

  /** @deprecated use setTheme directly */
  function cycleTheme () {
    const idx = THEME_IDS.indexOf(currentTheme.value)
    setTheme(THEME_IDS[(idx + 1) % THEME_IDS.length])
  }

  return {
    roomName, playerCount, currentRoomId, roomPresenceActive, roomHasActiveVote,
    configModalOpen, setConfigModalOpen,
    currentTheme, THEMES: THEME_IDS,
    toastMessage, toastType, toastVisible,
    showToast, setRoomInfo, setTheme, cycleTheme,
  }
})
