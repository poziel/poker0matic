export const DEFAULT_REACTION_EMOJIS = ['👍', '🎉', '❤️', '😂', '🤔', '🔥'] as const

export const MAX_REACTION_EMOJIS = 6

export interface RoomReactionEvent {
  emoji: string
  userId: string
  createdAt: number
}

export interface FloatingReaction {
  id: string
  emoji: string
  x: number
  y: number
  drift: number
  durationMs: number
}

export function sanitizeReactionEmojis (emojis: readonly string[] | null | undefined): string[] {
  const seen = new Set<string>()
  const sanitized: string[] = []

  for (const value of emojis ?? []) {
    const emoji = value.trim()
    if (!emoji || seen.has(emoji)) {
      continue
    }
    seen.add(emoji)
    sanitized.push(emoji)
    if (sanitized.length === MAX_REACTION_EMOJIS) {
      break
    }
  }

  return sanitized
}

export function getReactionEmojis (emojis: readonly string[] | null | undefined): string[] {
  const sanitized = sanitizeReactionEmojis(emojis)
  if (sanitized.length > 0) {
    return sanitized
  }
  return [...DEFAULT_REACTION_EMOJIS]
}
