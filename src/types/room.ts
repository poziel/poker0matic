export type VoteValue = number | string

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
  v?: number
  deck?: 'fibonacci' | 'linear' | 'tshirt' | 'custom'
  customDeck?: string | null
  specialQuestion?: boolean
  specialCoffee?: boolean
  historyEnabled?: boolean
  leaderModeEnabled?: boolean
  taskInformationEnabled?: boolean
}

export interface RoomRecord {
  name: string
  createdAt: number
  createdBy: string
  createdByUserId?: string | null
  leaderUserId?: string | null
  committedVote?: string | null
  currentTask?: TaskInfo | null
  roundEditLock?: RoundEditLock | null
  roundNumber?: number
  settings?: RoomSettings
  lastActivity?: number
}

export interface RoomUser {
  name: string
  joinedAt: number
  vote?: VoteValue
  avatarStyle?: string
  avatarSeed?: string
  avatarBg?: string
}

export interface RoomHistoryVoteSnapshot {
  name: string
  vote: VoteValue
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
  votes?: Record<string, string>
  voteSnapshots?: Record<string, RoomHistoryVoteSnapshot>
}
