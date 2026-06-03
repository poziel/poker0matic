import {
  SYSTEM_DARK_THEME_ID,
  SYSTEM_LIGHT_THEME_ID,
  THEME_IDS,
  type ThemeId,
} from '@/utils/themes'

export const THEME_STORAGE_KEY = 'poker_theme'

function isThemeId (theme: string): theme is ThemeId {
  return THEME_IDS.includes(theme as ThemeId)
}

export function getStoredTheme (): ThemeId | null {
  const saved = localStorage.getItem(THEME_STORAGE_KEY)

  return saved && isThemeId(saved) ? saved : null
}

export function getSystemTheme (): ThemeId {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? SYSTEM_DARK_THEME_ID
    : SYSTEM_LIGHT_THEME_ID
}

export function getInitialTheme (): ThemeId {
  return getStoredTheme() ?? getSystemTheme()
}

export function applyDocumentTheme (theme: ThemeId = getInitialTheme()) {
  document.documentElement.dataset.theme = theme

  return theme
}
