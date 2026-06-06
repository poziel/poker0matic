import { describe, expect, it } from 'vitest'
import {
  DEFAULT_REACTION_EMOJIS,
  getReactionEmojis,
  MAX_REACTION_EMOJIS,
  sanitizeReactionEmojis,
} from '@/utils/reactions'

describe('Feature: reaction emoji preferences', () => {
  it('Scenario: custom reaction emojis are trimmed, deduplicated, and capped', () => {
    const emojis = sanitizeReactionEmojis([' yes ', '', 'no', 'yes', 'maybe', 'later', 'soon', 'done', 'extra'])

    expect(emojis).toEqual(['yes', 'no', 'maybe', 'later', 'soon', 'done'])
    expect(emojis).toHaveLength(MAX_REACTION_EMOJIS)
  })

  it('Scenario: default reaction emojis are used when no valid custom emojis remain', () => {
    expect(getReactionEmojis(['', '   '])).toEqual([...DEFAULT_REACTION_EMOJIS])
  })

  it('Scenario: sanitized custom reaction emojis preserve the user chosen order', () => {
    expect(getReactionEmojis(['🔥', '👍', '🔥', '☕'])).toEqual(['🔥', '👍', '☕'])
  })
})
