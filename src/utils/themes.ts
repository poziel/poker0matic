export type ThemeMode = 'dark' | 'light'

export type ThemeDefinition = {
  id: string
  family: string
  label: string
  mode: ThemeMode
  dark: boolean
  preview: {
    bg: string
    accent: string
  }
  colors: {
    background: string
    surface: string
    primary: string
    secondary: string
    error: string
    warning: string
    success: string
    info: string
  }
}

export const THEME_DEFINITIONS = [
  {
    id: 'midnight',
    family: 'midnight',
    label: 'Midnight',
    mode: 'dark',
    dark: true,
    preview: { bg: '#0a0c10', accent: '#4f8cff' },
    colors: {
      background: '#0a0c10',
      surface: '#0f131a',
      primary: '#4f8cff',
      secondary: '#3ecf8e',
      error: '#f05a5a',
      warning: '#f5b14d',
      success: '#3ecf8e',
      info: '#4f8cff',
    },
  },
  {
    id: 'slate',
    family: 'slate',
    label: 'Slate',
    mode: 'dark',
    dark: true,
    preview: { bg: '#0d1015', accent: '#7c8cff' },
    colors: {
      background: '#0d1015',
      surface: '#131820',
      primary: '#7c8cff',
      secondary: '#6ee7b7',
      error: '#ef6b6b',
      warning: '#f6c56b',
      success: '#6ee7b7',
      info: '#7c8cff',
    },
  },
  {
    id: 'forest',
    family: 'forest',
    label: 'Forest',
    mode: 'dark',
    dark: true,
    preview: { bg: '#0a1110', accent: '#3ecf8e' },
    colors: {
      background: '#0a1110',
      surface: '#0e1716',
      primary: '#3ecf8e',
      secondary: '#84cc16',
      error: '#ef6b6b',
      warning: '#f5b14d',
      success: '#3ecf8e',
      info: '#67e8f9',
    },
  },
  {
    id: 'amber',
    family: 'amber',
    label: 'Amber',
    mode: 'dark',
    dark: true,
    preview: { bg: '#0d0b08', accent: '#f5b14d' },
    colors: {
      background: '#0d0b08',
      surface: '#14110c',
      primary: '#f5b14d',
      secondary: '#fb7185',
      error: '#f97373',
      warning: '#f5b14d',
      success: '#facc15',
      info: '#fdba74',
    },
  },
  {
    id: 'rose',
    family: 'rose',
    label: 'Rose',
    mode: 'dark',
    dark: true,
    preview: { bg: '#0f0810', accent: '#f472b6' },
    colors: {
      background: '#0f0810',
      surface: '#180e18',
      primary: '#f472b6',
      secondary: '#fb7185',
      error: '#fb7185',
      warning: '#fbbf24',
      success: '#34d399',
      info: '#c084fc',
    },
  },
  {
    id: 'violet',
    family: 'violet',
    label: 'Violet',
    mode: 'dark',
    dark: true,
    preview: { bg: '#090810', accent: '#a78bfa' },
    colors: {
      background: '#090810',
      surface: '#0e0d18',
      primary: '#a78bfa',
      secondary: '#f472b6',
      error: '#fb7185',
      warning: '#fbbf24',
      success: '#34d399',
      info: '#818cf8',
    },
  },
  {
    id: 'ocean',
    family: 'ocean',
    label: 'Ocean',
    mode: 'dark',
    dark: true,
    preview: { bg: '#070f12', accent: '#22d3ee' },
    colors: {
      background: '#070f12',
      surface: '#0c181c',
      primary: '#22d3ee',
      secondary: '#38bdf8',
      error: '#fb7185',
      warning: '#facc15',
      success: '#2dd4bf',
      info: '#60a5fa',
    },
  },
  {
    id: 'neon',
    family: 'neon',
    label: 'Neon',
    mode: 'dark',
    dark: true,
    preview: { bg: '#030505', accent: '#4ade80' },
    colors: {
      background: '#030505',
      surface: '#060a08',
      primary: '#4ade80',
      secondary: '#22d3ee',
      error: '#fb7185',
      warning: '#facc15',
      success: '#4ade80',
      info: '#67e8f9',
    },
  },
  {
    id: 'candy',
    family: 'candy',
    label: 'Candy',
    mode: 'dark',
    dark: true,
    preview: { bg: '#0d0614', accent: '#e879f9' },
    colors: {
      background: '#0d0614',
      surface: '#130a1e',
      primary: '#e879f9',
      secondary: '#fb7185',
      error: '#fb7185',
      warning: '#fbbf24',
      success: '#34d399',
      info: '#c084fc',
    },
  },
  {
    id: 'midnight-light',
    family: 'midnight',
    label: 'Midnight',
    mode: 'light',
    dark: false,
    preview: { bg: '#edf3ff', accent: '#4f8cff' },
    colors: {
      background: '#f4f8ff',
      surface: '#ffffff',
      primary: '#4f8cff',
      secondary: '#0f766e',
      error: '#dc2626',
      warning: '#d97706',
      success: '#059669',
      info: '#2563eb',
    },
  },
  {
    id: 'slate-light',
    family: 'slate',
    label: 'Slate',
    mode: 'light',
    dark: false,
    preview: { bg: '#eff3fb', accent: '#7c8cff' },
    colors: {
      background: '#f6f8fc',
      surface: '#ffffff',
      primary: '#6677f5',
      secondary: '#475569',
      error: '#dc2626',
      warning: '#d97706',
      success: '#0f766e',
      info: '#4f46e5',
    },
  },
  {
    id: 'forest-light',
    family: 'forest',
    label: 'Forest',
    mode: 'light',
    dark: false,
    preview: { bg: '#eef9f5', accent: '#3ecf8e' },
    colors: {
      background: '#f4fbf7',
      surface: '#ffffff',
      primary: '#1f9d68',
      secondary: '#3f6212',
      error: '#dc2626',
      warning: '#b45309',
      success: '#15803d',
      info: '#0f766e',
    },
  },
  {
    id: 'amber-light',
    family: 'amber',
    label: 'Amber',
    mode: 'light',
    dark: false,
    preview: { bg: '#fff6e8', accent: '#f5b14d' },
    colors: {
      background: '#fffaf1',
      surface: '#ffffff',
      primary: '#d48a14',
      secondary: '#c2410c',
      error: '#dc2626',
      warning: '#b45309',
      success: '#a16207',
      info: '#ea580c',
    },
  },
  {
    id: 'rose-light',
    family: 'rose',
    label: 'Rose',
    mode: 'light',
    dark: false,
    preview: { bg: '#fff0f7', accent: '#f472b6' },
    colors: {
      background: '#fff7fb',
      surface: '#ffffff',
      primary: '#db2777',
      secondary: '#e11d48',
      error: '#dc2626',
      warning: '#c2410c',
      success: '#0f766e',
      info: '#7c3aed',
    },
  },
  {
    id: 'violet-light',
    family: 'violet',
    label: 'Violet',
    mode: 'light',
    dark: false,
    preview: { bg: '#f5f1ff', accent: '#a78bfa' },
    colors: {
      background: '#faf7ff',
      surface: '#ffffff',
      primary: '#7c3aed',
      secondary: '#a855f7',
      error: '#dc2626',
      warning: '#c2410c',
      success: '#0f766e',
      info: '#6366f1',
    },
  },
  {
    id: 'ocean-light',
    family: 'ocean',
    label: 'Ocean',
    mode: 'light',
    dark: false,
    preview: { bg: '#eefcff', accent: '#22d3ee' },
    colors: {
      background: '#f3fdff',
      surface: '#ffffff',
      primary: '#0891b2',
      secondary: '#0284c7',
      error: '#dc2626',
      warning: '#b45309',
      success: '#0f766e',
      info: '#2563eb',
    },
  },
  {
    id: 'neon-light',
    family: 'neon',
    label: 'Neon',
    mode: 'light',
    dark: false,
    preview: { bg: '#f3ffef', accent: '#4ade80' },
    colors: {
      background: '#f8fff5',
      surface: '#ffffff',
      primary: '#16a34a',
      secondary: '#0f766e',
      error: '#dc2626',
      warning: '#b45309',
      success: '#15803d',
      info: '#0f766e',
    },
  },
  {
    id: 'candy-light',
    family: 'candy',
    label: 'Candy',
    mode: 'light',
    dark: false,
    preview: { bg: '#fff0ff', accent: '#e879f9' },
    colors: {
      background: '#fff7ff',
      surface: '#ffffff',
      primary: '#c026d3',
      secondary: '#db2777',
      error: '#dc2626',
      warning: '#c2410c',
      success: '#0f766e',
      info: '#7c3aed',
    },
  },
] as const satisfies readonly ThemeDefinition[]

export type ThemeId = typeof THEME_DEFINITIONS[number]['id']

export const SYSTEM_DARK_THEME_ID: ThemeId = 'midnight'
export const SYSTEM_LIGHT_THEME_ID: ThemeId = 'midnight-light'
export const DEFAULT_THEME_ID: ThemeId = SYSTEM_DARK_THEME_ID

export const THEME_IDS = THEME_DEFINITIONS.map(theme => theme.id) as ThemeId[]

export const THEMES_BY_MODE = {
  dark: THEME_DEFINITIONS.filter(theme => theme.mode === 'dark'),
  light: THEME_DEFINITIONS.filter(theme => theme.mode === 'light'),
} satisfies Record<ThemeMode, readonly ThemeDefinition[]>

export const THEME_LOOKUP = Object.fromEntries(
  THEME_DEFINITIONS.map(theme => [theme.id, theme]),
) as Record<ThemeId, ThemeDefinition>
