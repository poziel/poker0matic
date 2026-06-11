import type { RoomConsoleLogEntry, RoomUser, VoteValue } from '@/types/room'

export const MAX_CONSOLE_LOG_ENTRIES = 160

function sanitizeConsoleLogIdPart (value: string): string {
  return value
    .replaceAll('.', '-')
    .replaceAll('#', '-')
    .replaceAll('$', '-')
    .replaceAll('/', '-')
    .replaceAll('[', '-')
    .replaceAll(']', '-')
}

export function normalizeConsoleLogEntries (value: unknown): RoomConsoleLogEntry[] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return []
  }
  return Object.entries(value as Record<string, Partial<RoomConsoleLogEntry>>)
    .flatMap(([key, entry]) => {
      if (!entry || typeof entry !== 'object') {
        return []
      }
      if (typeof entry.message !== 'string' || typeof entry.createdAt !== 'number') {
        return []
      }
      const level: RoomConsoleLogEntry['level'] = entry.level === 'trace' || entry.level === 'result' || entry.level === 'system'
        ? entry.level
        : 'info'
      return [{
        id: typeof entry.id === 'string' ? entry.id : key,
        level,
        message: entry.message,
        createdAt: entry.createdAt,
        round: typeof entry.round === 'number' ? entry.round : 1,
        userId: typeof entry.userId === 'string' ? entry.userId : null,
        userName: typeof entry.userName === 'string' ? entry.userName : null,
        vote: entry.vote ?? null,
      }]
    })
    .toSorted((a, b) => a.createdAt - b.createdAt || a.id.localeCompare(b.id))
}

export function buildConsoleLogId (
  createdAt: number,
  suffix = Math.random().toString(36).slice(2, 8),
): string {
  return `log-${createdAt}-${sanitizeConsoleLogIdPart(suffix)}`
}

export function buildConsoleLogEntry (
  level: RoomConsoleLogEntry['level'],
  message: string,
  createdAt: number,
  round: number,
  options: {
    id?: string
    userId?: string | null
    userName?: string | null
    vote?: VoteValue | null
  } = {},
): RoomConsoleLogEntry {
  return {
    id: options.id ?? buildConsoleLogId(createdAt),
    level,
    message,
    createdAt,
    round,
    userId: options.userId ?? null,
    userName: options.userName ?? null,
    vote: options.vote ?? null,
  }
}

export function buildVoteConsoleLogEntry (
  previousVote: VoteValue | null,
  newVote: VoteValue | null,
  createdAt: number,
  round: number,
  userId: string,
  userName: string,
): RoomConsoleLogEntry {
  const message = newVote == null
    ? `${userName} cleared their vote.`
    : (previousVote == null ? `${userName} voted.` : `${userName} changed their vote.`)

  return buildConsoleLogEntry(
    'trace',
    message,
    createdAt,
    round,
    {
      userId,
      userName,
    },
  )
}

export function buildConsoleLogAppendUpdates (
  entries: RoomConsoleLogEntry[],
  existingLog?: Record<string, RoomConsoleLogEntry>,
  maxEntries = MAX_CONSOLE_LOG_ENTRIES,
): Record<string, unknown> {
  const updates: Record<string, unknown> = {}
  const existingEntries = normalizeConsoleLogEntries(existingLog)
  const overflowCount = Math.max(0, existingEntries.length + entries.length - maxEntries)
  for (const entry of existingEntries.slice(0, overflowCount)) {
    updates[`consoleLog/${entry.id}`] = null
  }
  for (const entry of entries) {
    updates[`consoleLog/${entry.id}`] = entry
  }
  return updates
}

export function buildRoundConsoleLogMap (
  roundNumber: number,
  participants: Record<string, RoomUser>,
  createdAt: number,
  action: 'started' | 'reset' = 'started',
): Record<string, RoomConsoleLogEntry> {
  const entries = [
    buildConsoleLogEntry(
      'system',
      action === 'reset' ? `Round ${roundNumber} reset. Console attached.` : `Console attached to round ${roundNumber}.`,
      createdAt,
      roundNumber,
      { id: `round-${roundNumber}-0000-system` },
    ),
    ...Object.entries(participants)
      .toSorted(([, a], [, b]) => a.joinedAt - b.joinedAt)
      .map(([userId, user], index) => buildConsoleLogEntry(
        'info',
        `${user.name} is in the lobby.`,
        createdAt + index + 1,
        roundNumber,
        {
          id: `round-${roundNumber}-${String(index + 1).padStart(4, '0')}-${sanitizeConsoleLogIdPart(userId)}`,
          userId,
          userName: user.name,
        },
      )),
  ]
  return Object.fromEntries(entries.map(entry => [entry.id, entry]))
}
