import {
  DEFAULT_THEME_FAMILY,
  DEFAULT_THEME_MODE_PREFERENCE,
  getThemeFamilyFromId,
  getThemeModeFromId,
  resolveThemeId,
  THEME_FAMILIES,
  THEME_IDS,
  type ThemeFamily,
  type ThemeId,
  type ThemeModePreference,
} from '@/utils/themes'

export const THEME_STORAGE_KEY = 'refinimo_theme'
export const THEME_MODE_STORAGE_KEY = 'refinimo_theme_mode'
const LEGACY_THEME_STORAGE_KEY = 'poker_theme'
const LEGACY_THEME_MODE_STORAGE_KEY = 'poker_theme_mode'

function isThemeId (theme: string): theme is ThemeId {
  return THEME_IDS.includes(theme as ThemeId)
}

function isThemeFamily (theme: string): theme is ThemeFamily {
  return THEME_FAMILIES.includes(theme as ThemeFamily)
}

function isThemeModePreference (mode: string): mode is ThemeModePreference {
  return mode === 'system' || mode === 'dark' || mode === 'light'
}

export function getSystemPrefersDark (): boolean {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true
}

export function getStoredThemeFamily (): ThemeFamily | null {
  const saved = localStorage.getItem(THEME_STORAGE_KEY) ?? localStorage.getItem(LEGACY_THEME_STORAGE_KEY)
  if (saved && isThemeId(saved)) {
    if (localStorage.getItem(THEME_MODE_STORAGE_KEY) === null) {
      localStorage.setItem(THEME_MODE_STORAGE_KEY, getThemeModeFromId(saved))
    }
    localStorage.setItem(THEME_STORAGE_KEY, getThemeFamilyFromId(saved))
  } else if (saved && localStorage.getItem(THEME_STORAGE_KEY) === null) {
    localStorage.setItem(THEME_STORAGE_KEY, saved)
  }

  if (!saved) {
    return null
  }
  if (isThemeFamily(saved)) {
    return saved
  }
  if (isThemeId(saved)) {
    return getThemeFamilyFromId(saved)
  }

  return null
}

export function getStoredThemeModePreference (): ThemeModePreference | null {
  const saved = localStorage.getItem(THEME_MODE_STORAGE_KEY) ?? localStorage.getItem(LEGACY_THEME_MODE_STORAGE_KEY)
  if (saved && isThemeModePreference(saved)) {
    if (localStorage.getItem(THEME_MODE_STORAGE_KEY) === null) {
      localStorage.setItem(THEME_MODE_STORAGE_KEY, saved)
    }
    return saved
  }

  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) ?? localStorage.getItem(LEGACY_THEME_STORAGE_KEY)
  if (savedTheme && isThemeId(savedTheme)) {
    const legacyMode = getThemeModeFromId(savedTheme)
    if (localStorage.getItem(THEME_MODE_STORAGE_KEY) === null) {
      localStorage.setItem(THEME_MODE_STORAGE_KEY, legacyMode)
    }
    return legacyMode
  }

  return null
}

export function getInitialThemeFamily (): ThemeFamily {
  return getStoredThemeFamily() ?? DEFAULT_THEME_FAMILY
}

export function getInitialThemeModePreference (): ThemeModePreference {
  return getStoredThemeModePreference() ?? DEFAULT_THEME_MODE_PREFERENCE
}

export function getInitialTheme (): ThemeId {
  return resolveThemeId(getInitialThemeFamily(), getInitialThemeModePreference(), getSystemPrefersDark())
}

export function applyDocumentTheme (theme: ThemeId = getInitialTheme()) {
  document.documentElement.dataset.theme = theme

  return theme
}
