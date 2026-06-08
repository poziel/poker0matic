import { Avatar } from '@dicebear/core'
import { DEFAULT_THEME_ID, THEME_LOOKUP, type ThemeId } from '@/utils/themes'

interface DiceBearStyleDefinition {
  title?: string
}

export interface AvatarStyle {
  id: string
  label: string
  recommended?: boolean
  previews: string[]
}

export interface AvatarBackgroundPreset {
  label: string
  color: string
}

export type AvatarSource = 'dicebear' | 'gravatar' | 'custom'

export interface AvatarCrop {
  left: number
  top: number
  width: number
  height: number
}

const PREVIEW_SEEDS = ['POZIEL', 'MOCTEK', 'HOGARD', 'ROZETA', 'SOTVEN']
export const AVATAR_BACKGROUND_PRESETS: AvatarBackgroundPreset[] = [
  { label: 'Ice', color: '#f0f7ff' },
  { label: 'Mint', color: '#ecfdf5' },
  { label: 'Lemon', color: '#fef9c3' },
  { label: 'Peach', color: '#ffedd5' },
  { label: 'Rose', color: '#ffe4e6' },
  { label: 'Lilac', color: '#f3e8ff' },
  { label: 'Sky', color: '#e0f2fe' },
]
const PREVIEW_BACKGROUNDS = AVATAR_BACKGROUND_PRESETS.slice(0, PREVIEW_SEEDS.length).map(preset => preset.color)
const RECOMMENDED_STYLES = new Set([
  'adventurer-neutral',
  'fun-emoji',
  'lorelei',
  'miniavs',
  'notionists',
  'notionists-neutral',
  'thumbs',
])

const styleDefinitions = import.meta.glob<DiceBearStyleDefinition>(
  '../../node_modules/@dicebear/styles/dist/*.min.json',
  {
    eager: true,
    import: 'default',
  },
)

/**
 * Neutral dark blue-gray used when a user has not chosen a custom background.
 * Deliberately more elevated than any theme's --bg-elev so transparent avatar
 * styles remain legible without requiring user action.
 */
export const DEFAULT_AVATAR_BG = '#dbeafe'

/**
 * Sentinel stored in avatarBg when the user opts into "follow theme".
 * PlayerAvatar maps this to a CSS color-mix so every viewer's own theme is used.
 */
export const THEME_BG_VALUE = 'theme'

export const DEFAULT_AVATAR_STYLE = 'notionists-neutral'
export const DEFAULT_AVATAR_SOURCE: AvatarSource = 'dicebear'
export const DEFAULT_AVATAR_CROP: AvatarCrop = {
  left: 0,
  top: 0,
  width: 1,
  height: 1,
}

/** All DiceBear styles discovered from the installed @dicebear/styles package. */
export const AVATAR_STYLES: AvatarStyle[] = Object.entries(styleDefinitions)
  .map(([path, definition]) => {
    const id = path.match(/\/([^/]+)\.min\.json$/)?.[1] ?? ''
    return {
      id,
      label: definition.title ?? formatAvatarStyleLabel(id),
      recommended: RECOMMENDED_STYLES.has(id),
      previews: PREVIEW_SEEDS.map((seed, index) => buildLocalAvatarDataUri(
        definition,
        seed,
        PREVIEW_BACKGROUNDS[index] ?? DEFAULT_AVATAR_BG,
      )),
    }
  })
  .filter(style => style.id)
  .toSorted((left, right) => left.label.localeCompare(right.label))

/**
 * Build a DiceBear avatar URL.
 *
 * The selected background is part of the generated SVG URL so room records that
 * store avatarUrl render the same avatar anywhere they are reused.
 */
export function buildAvatarUrl (style: string, seed: string, backgroundColor = DEFAULT_AVATAR_BG): string {
  const params = new URLSearchParams({
    seed,
    backgroundColor: normalizeDiceBearBackgroundColor(backgroundColor),
  })

  return `https://api.dicebear.com/10.x/${style}/svg?${params.toString()}`
}

export function buildSelectedAvatarUrl ({
  avatarSource,
  customAvatarUrl,
  gravatarEmail,
  avatarStyle,
  avatarSeed,
  avatarBg,
  fallbackSeed,
}: {
  avatarSource: AvatarSource
  customAvatarUrl?: string | null
  gravatarEmail?: string | null
  avatarStyle: string
  avatarSeed: string
  avatarBg?: string
  fallbackSeed: string
}): string {
  if (avatarSource === 'custom' && isValidCustomAvatarUrl(customAvatarUrl)) {
    return customAvatarUrl.trim()
  }

  if (avatarSource === 'gravatar' && isValidGravatarEmail(gravatarEmail)) {
    return buildGravatarAvatarUrl(gravatarEmail)
  }

  return buildAvatarUrl(
    avatarStyle || DEFAULT_AVATAR_STYLE,
    avatarSeed || fallbackSeed || 'Guest',
    avatarBg || DEFAULT_AVATAR_BG,
  )
}

export function buildSelectedAvatarCrop (
  avatarSource: AvatarSource,
  customAvatarCrop: AvatarCrop | null | undefined,
): AvatarCrop | null {
  return avatarSource === 'custom'
    ? normalizeAvatarCrop(customAvatarCrop)
    : null
}

export function buildGravatarAvatarUrl (email: string, size = 256): string {
  const hash = sha256(normalizeGravatarEmail(email))
  const params = new URLSearchParams({
    s: String(size),
    d: '404',
    r: 'g',
  })

  return `https://www.gravatar.com/avatar/${hash}?${params.toString()}`
}

export function createRandomAvatarSeed (): string {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID().replaceAll('-', '')
  }

  if (globalThis.crypto?.getRandomValues) {
    const values = new Uint32Array(4)
    globalThis.crypto.getRandomValues(values)
    return Array.from(values, value => value.toString(36).padStart(6, '0')).join('')
  }

  const first = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(36)
  const second = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(36)
  const third = Date.now().toString(36)
  return `${first}${second}${third}`
}

export function isValidCustomAvatarUrl (url: string | null | undefined): url is string {
  if (!url?.trim()) {
    return false
  }

  try {
    const parsed = new URL(url.trim())
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
  } catch {
    return false
  }
}

export function isValidGravatarEmail (email: string | null | undefined): email is string {
  const normalized = normalizeGravatarEmail(email ?? '')
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)
}

export function normalizeGravatarEmail (email: string): string {
  return email.trim().toLowerCase()
}

export function normalizeAvatarCrop (crop: AvatarCrop | null | undefined): AvatarCrop | null {
  if (!crop) {
    return null
  }

  const width = clampCropValue(crop.width)
  const height = clampCropValue(crop.height)
  if (width <= 0 || height <= 0) {
    return null
  }

  const left = clamp(crop.left, 0, 1 - width)
  const top = clamp(crop.top, 0, 1 - height)
  return { left, top, width, height }
}

export function normalizeDiceBearBackgroundColor (color: string): string {
  const normalized = color.trim().replace(/^#/, '')
  return /^[\da-f]{6}$/i.test(normalized) ? normalized.toLowerCase() : 'ffffff'
}

export function resolveAvatarBackgroundColor (avatarBg: string, themeId: ThemeId = DEFAULT_THEME_ID): string {
  if (avatarBg === THEME_BG_VALUE) {
    return THEME_LOOKUP[themeId]?.preview.accent ?? THEME_LOOKUP[DEFAULT_THEME_ID].preview.accent
  }

  return avatarBg || DEFAULT_AVATAR_BG
}

function formatAvatarStyleLabel (id: string): string {
  return id
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
    .replace(/\bNeutral\b/, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function buildLocalAvatarDataUri (definition: DiceBearStyleDefinition, seed: string, backgroundColor: string): string {
  const avatar = new Avatar(definition, {
    seed,
    backgroundColor: [normalizeDiceBearBackgroundColor(backgroundColor)],
  })

  return avatar.toDataUri()
}

/* eslint-disable unicorn/numeric-separators-style -- SHA-256 constants are conventionally written as 8-digit hex words. */
function sha256 (message: string): string {
  const bytes = new TextEncoder().encode(message)
  const hash = new Uint32Array([
    0x6a09e667,
    0xbb67ae85,
    0x3c6ef372,
    0xa54ff53a,
    0x510e527f,
    0x9b05688c,
    0x1f83d9ab,
    0x5be0cd19,
  ])
  const constants = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
    0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
    0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
    0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
    0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
    0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
    0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ])
  const bitLength = bytes.length * 8
  const paddedLength = Math.ceil((bytes.length + 9) / 64) * 64
  const padded = new Uint8Array(paddedLength)
  padded.set(bytes)
  padded[bytes.length] = 0x80

  const view = new DataView(padded.buffer)
  view.setUint32(paddedLength - 4, bitLength, false)

  const words = new Uint32Array(64)

  for (let offset = 0; offset < paddedLength; offset += 64) {
    for (let index = 0; index < 16; index += 1) {
      words[index] = view.getUint32(offset + index * 4, false)
    }

    for (let index = 16; index < 64; index += 1) {
      const s0 = rotateRight(words[index - 15], 7) ^ rotateRight(words[index - 15], 18) ^ (words[index - 15] >>> 3)
      const s1 = rotateRight(words[index - 2], 17) ^ rotateRight(words[index - 2], 19) ^ (words[index - 2] >>> 10)
      words[index] = (words[index - 16] + s0 + words[index - 7] + s1) >>> 0
    }

    let [a, b, c, d, e, f, g, h] = hash

    for (let index = 0; index < 64; index += 1) {
      const s1 = rotateRight(e, 6) ^ rotateRight(e, 11) ^ rotateRight(e, 25)
      const ch = (e & f) ^ (~e & g)
      const temp1 = (h + s1 + ch + constants[index] + words[index]) >>> 0
      const s0 = rotateRight(a, 2) ^ rotateRight(a, 13) ^ rotateRight(a, 22)
      const maj = (a & b) ^ (a & c) ^ (b & c)
      const temp2 = (s0 + maj) >>> 0

      h = g
      g = f
      f = e
      e = (d + temp1) >>> 0
      d = c
      c = b
      b = a
      a = (temp1 + temp2) >>> 0
    }

    hash[0] = (hash[0] + a) >>> 0
    hash[1] = (hash[1] + b) >>> 0
    hash[2] = (hash[2] + c) >>> 0
    hash[3] = (hash[3] + d) >>> 0
    hash[4] = (hash[4] + e) >>> 0
    hash[5] = (hash[5] + f) >>> 0
    hash[6] = (hash[6] + g) >>> 0
    hash[7] = (hash[7] + h) >>> 0
  }

  return Array.from(hash, value => value.toString(16).padStart(8, '0')).join('')
}

function rotateRight (value: number, bits: number): number {
  return (value >>> bits) | (value << (32 - bits))
}
/* eslint-enable unicorn/numeric-separators-style */

function clampCropValue (value: number): number {
  return Number.isFinite(value) ? clamp(value, 0, 1) : 0
}

function clamp (value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
