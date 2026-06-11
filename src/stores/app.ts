import { defineStore } from 'pinia'
import { ref } from 'vue'
import vuetify from '@/plugins/vuetify'
import {
  applyDocumentTheme,
  getInitialThemeFamily,
  getInitialThemeModePreference,
  getSystemPrefersDark,
  THEME_MODE_STORAGE_KEY,
  THEME_STORAGE_KEY,
} from '@/utils/themeBootstrap'
import {
  getThemeFamilyFromId,
  getThemeModeFromId,
  resolveThemeId,
  THEME_FAMILIES,
  type ThemeFamily,
  type ThemeId,
  type ThemeModePreference,
} from '@/utils/themes'

export const useAppStore = defineStore('app', () => {
  const roomName = ref('')
  const playerCount = ref(0)
  const currentRoomId = ref<string | null>(null)
  const roomPresenceActive = ref(false)
  const roomHasRoundParticipant = ref(false)
  const externalDockActive = ref(false)
  const configModalOpen = ref(false)
  const preferencesModalOpen = ref(false)
  const keyboardShortcutsModalOpen = ref(false)

  const systemThemeQuery = window.matchMedia?.('(prefers-color-scheme: dark)')
  const currentThemeFamily = ref<ThemeFamily>(getInitialThemeFamily())
  const themeModePreference = ref<ThemeModePreference>(getInitialThemeModePreference())
  const currentTheme = ref<ThemeId>(resolveCurrentTheme())
  applyTheme(currentTheme.value)
  systemThemeQuery?.addEventListener?.('change', applySystemTheme)

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
    hasRoundParticipant = false,
  ) {
    currentRoomId.value = id
    roomName.value = name
    playerCount.value = count
    roomPresenceActive.value = presenceActive
    roomHasRoundParticipant.value = hasRoundParticipant
  }

  function setConfigModalOpen (open: boolean) {
    configModalOpen.value = open
  }

  function setPreferencesModalOpen (open: boolean) {
    preferencesModalOpen.value = open
  }

  function setKeyboardShortcutsModalOpen (open: boolean) {
    keyboardShortcutsModalOpen.value = open
  }

  function setExternalDockActive (active: boolean) {
    externalDockActive.value = active
  }

  // -- theme --------------------------------------------------------------
  function applyTheme (theme: ThemeId) {
    applyDocumentTheme(theme)
    vuetify.theme.change(theme)
  }

  function resolveCurrentTheme () {
    return resolveThemeId(
      currentThemeFamily.value,
      themeModePreference.value,
      systemThemeQuery?.matches ?? getSystemPrefersDark(),
    )
  }

  function applyCurrentTheme () {
    const theme = resolveCurrentTheme()
    currentTheme.value = theme
    applyTheme(theme)
  }

  function setTheme (theme: ThemeFamily) {
    currentThemeFamily.value = theme
    applyCurrentTheme()
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }

  function setThemeModePreference (modePreference: ThemeModePreference) {
    themeModePreference.value = modePreference
    applyCurrentTheme()
    localStorage.setItem(THEME_MODE_STORAGE_KEY, modePreference)
  }

  function setResolvedTheme (theme: ThemeId) {
    currentThemeFamily.value = getThemeFamilyFromId(theme)
    themeModePreference.value = getThemeModeFromId(theme)
    applyCurrentTheme()
    localStorage.setItem(THEME_STORAGE_KEY, currentThemeFamily.value)
    localStorage.setItem(THEME_MODE_STORAGE_KEY, themeModePreference.value)
  }

  function applySystemTheme () {
    if (themeModePreference.value === 'system') {
      applyCurrentTheme()
    }
  }

  /** @deprecated use setTheme directly */
  function cycleTheme () {
    const idx = THEME_FAMILIES.indexOf(currentThemeFamily.value)
    setTheme(THEME_FAMILIES[(idx + 1) % THEME_FAMILIES.length])
  }

  return {
    roomName, playerCount, currentRoomId, roomPresenceActive, roomHasRoundParticipant,
    externalDockActive, setExternalDockActive,
    configModalOpen, setConfigModalOpen,
    preferencesModalOpen, setPreferencesModalOpen,
    keyboardShortcutsModalOpen, setKeyboardShortcutsModalOpen,
    currentTheme, currentThemeFamily, themeModePreference, THEMES: THEME_FAMILIES,
    toastMessage, toastType, toastVisible,
    showToast, setRoomInfo, setTheme, setThemeModePreference, setResolvedTheme, cycleTheme,
  }
})
