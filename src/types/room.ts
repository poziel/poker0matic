export type VoteValue = number | string

export interface AvatarCrop {
  left: number
  top: number
  width: number
  height: number
}

export interface TaskInfo {
  title: string
  url?: string | null
  description?: string | null
}

export interface RoundEditLock {
  userId: string
  userName: string
  acquiredAt: number
}

export interface RoomSettings {
  showVotes?: boolean
  allowVoteChangesAfterReveal?: boolean
  v?: number
  deck?: 'fibonacci' | 'modified-fibonacci' | 'linear' | 'power-of-2' | 'tshirt' | 'custom'
  customDeck?: string | null
  specialQuestion?: boolean
  specialCoffee?: boolean
  historyEnabled?: boolean
  leaderModeEnabled?: boolean
  taskInformationEnabled?: boolean
  timerEnabled?: boolean
  timerMode?: 'automatic' | 'manual'
  timerDurationSeconds?: number
  timerAutoRevealEnabled?: boolean
  timerWarningEnabled?: boolean
  timerWarningType?: 'seconds' | 'percentage'
  timerWarningValue?: number
  reactionsEnabled?: boolean
  reactionEmojis?: string[]
}

export interface RoundTimerState {
  status: 'idle' | 'running' | 'paused' | 'finished'
  mode: 'automatic' | 'manual'
  durationMs: number
  roundNumber: number
  startedAt?: number | null
  endsAt?: number | null
  remainingMs?: number | null
  finishedBy?: 'expired' | 'revealed' | null
}

export interface RoomRecord {
  name: string
  createdAt: number
  createdBy: string
  createdByUserId?: string | null
  leaderUserId?: string | null
  committedVote?: string | null
  currentTask?: TaskInfo | null
  roundParticipants?: Record<string, RoomUser>
  roundEditLock?: RoundEditLock | null
  roundNumber?: number
  roundTimer?: RoundTimerState | null
  settings?: RoomSettings
  lastActivity?: number
}

export interface RoomUser {
  name: string
  joinedAt: number
  vote?: VoteValue
  avatarUrl?: string | null
  avatarCrop?: AvatarCrop | null
}

export interface RoomHistoryVoteSnapshot {
  name: string
  vote: VoteValue
  avatarUrl?: string | null
  avatarCrop?: AvatarCrop | null
}

export interface RoomHistoryEntry {
  id: string
  title?: string | null
  url?: string | null
  description?: string | null
  finalVote: string | null
  avg?: string | null
  closest?: string | null
  round: number
  durationMs?: number
  duration?: string
  completedAt?: number
  participantCount: number
  consensus: 'yes' | 'split'
  votes?: Record<string, RoomHistoryVoteSnapshot>
  voteSnapshots?: Record<string, RoomHistoryVoteSnapshot>
}
