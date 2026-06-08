import type { RoomRecord, RoomUser, VoteValue } from '@/types/room'
import { ref as dbRef, onValue, update } from 'firebase/database'
import { storeToRefs } from 'pinia'
import { computed, type ComputedRef, ref, type Ref } from 'vue'
import { useConfigStore } from '@/stores/config'

type ConsensusState = 'consensus' | 'close' | 'split'

interface RoundStats {
  avg: number | null
  median: number | null
  closest: number | null
  min: number | null
  max: number | null
  spread: number | null
  counts: Record<string, number>
  maxCount: number
  total: number
  numericTotal: number
  consensus: ConsensusState
}

interface RoomVotingDockOptions {
  userId?: ComputedRef<string | null> | Ref<string | null>
  userName?: ComputedRef<string> | Ref<string>
}

const PRESET_DECKS: Record<string, VoteValue[]> = {
  fibonacci: [0, 1, 2, 3, 5, 8, 13, 21, 34, 55],
  linear: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15],
  tshirt: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
}

function parseCustomDeck (raw: string): VoteValue[] {
  return raw.split(',').flatMap(s => {
    const value = s.trim()
    if (!value) {
      return []
    }
    const numericValue = Number(value)
    return [Number.isNaN(numericValue) ? value : numericValue]
  })
}

function countVotes (votes: readonly VoteValue[]): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const vote of votes) {
    const key = String(vote)
    counts[key] = (counts[key] ?? 0) + 1
  }
  return counts
}

function formatNum (num: number | null | undefined): string {
  if (num == null) {
    return '-'
  }
  return Number.isInteger(num) ? String(num) : String(Number.parseFloat(num.toFixed(2)))
}

export function useRoomVotingDock (options: RoomVotingDockOptions = {}) {
  const configStore = useConfigStore()
  const { userName } = storeToRefs(configStore)

  const currentRoom = ref<RoomRecord | null>(null)
  const roomUsers = ref<Record<string, RoomUser>>({})
  const roomMissing = ref(false)
  const activeRoomId = ref<string | null>(null)
  const db = computed(() => configStore.getDb())

  let unsubscribeRoom: (() => void) | null = null
  let unsubscribeUsers: (() => void) | null = null

  const showVotes = computed(() => currentRoom.value?.settings?.showVotes === true)
  const historyEnabled = computed(() => currentRoom.value?.settings?.historyEnabled !== false)
  const allowVoteChangesAfterReveal = computed(() => currentRoom.value?.settings?.allowVoteChangesAfterReveal === true)
  const leaderModeEnabled = computed(() => currentRoom.value?.settings?.leaderModeEnabled === true)
  const taskInformationEnabled = computed(() => currentRoom.value?.settings?.taskInformationEnabled === true)
  const currentTask = computed(() => currentRoom.value?.currentTask ?? null)
  const committedVote = computed(() => currentRoom.value?.committedVote ?? null)
  const leaderUserId = computed(() => currentRoom.value?.leaderUserId ?? null)
  const effectiveUserId = computed(() => options.userId?.value ?? configStore.userId)
  const effectiveUserName = computed(() => options.userName?.value ?? userName.value)
  const isLeader = computed(() => !leaderModeEnabled.value || (!!effectiveUserId.value && leaderUserId.value === effectiveUserId.value))
  const isRoundLockedByOther = computed(() =>
    !!currentRoom.value?.roundEditLock
    && !!effectiveUserId.value
    && currentRoom.value.roundEditLock.userId !== effectiveUserId.value,
  )

  const activeRoundParticipants = computed<Record<string, RoomUser>>(() =>
    currentRoom.value?.roundParticipants ?? roomUsers.value,
  )
  const currentParticipant = computed(() =>
    effectiveUserId.value ? activeRoundParticipants.value[effectiveUserId.value] : undefined,
  )

  const voteOptions = computed((): VoteValue[] => {
    const settings = currentRoom.value?.settings
    let base: VoteValue[]
    if (settings?.deck === 'custom') {
      base = parseCustomDeck(settings.customDeck ?? '')
      if (base.length === 0) {
        base = [...PRESET_DECKS.fibonacci]
      }
    } else {
      base = [...(PRESET_DECKS[settings?.deck ?? 'fibonacci'] ?? PRESET_DECKS.fibonacci)]
    }
    if (settings?.specialQuestion !== false) {
      base.push('?')
    }
    if (settings?.specialCoffee !== false) {
      base.push('☕')
    }
    return base
  })

  const deckNums = computed(() =>
    voteOptions.value.filter((value): value is number => typeof value === 'number'),
  )
  const revealedVotes = computed(() =>
    Object.values(activeRoundParticipants.value)
      .map(user => user.vote)
      .filter((vote): vote is VoteValue => vote != null),
  )
  const displayVoteCounts = computed((): Record<string, number> | null => {
    if (!showVotes.value) {
      return null
    }
    const counts = countVotes(revealedVotes.value)
    return Object.keys(counts).length > 0 ? counts : null
  })
  const selectedVote = computed(() => currentParticipant.value?.vote ?? null)
  const canVoteInCurrentRound = computed(() =>
    !!currentParticipant.value
    && (!showVotes.value || allowVoteChangesAfterReveal.value)
    && !isRoundLockedByOther.value
    && (!taskInformationEnabled.value || !!currentTask.value),
  )
  const canCommitFinalVote = computed(() => !leaderModeEnabled.value || isLeader.value)
  const voteActionHint = computed(() => {
    if (!currentParticipant.value) {
      return 'Join the room in the main window before voting here'
    }
    if (leaderModeEnabled.value && !isLeader.value) {
      return 'Waiting for the leader to manage this round'
    }
    if (isRoundLockedByOther.value) {
      return `${currentRoom.value?.roundEditLock?.userName ?? 'Another participant'} is entering task information`
    }
    if (taskInformationEnabled.value && !currentTask.value) {
      return 'Task information is required before anyone can vote'
    }
    if (showVotes.value && !allowVoteChangesAfterReveal.value) {
      return 'Voting is locked after reveal for this room'
    }
    return ''
  })

  const numericVotes = computed(() =>
    revealedVotes.value.filter((vote): vote is number => typeof vote === 'number'),
  )
  const averageVote = computed(() => {
    if (numericVotes.value.length === 0) {
      return null
    }
    const sum = numericVotes.value.reduce((acc, val) => acc + val, 0)
    return Number.parseFloat((sum / numericVotes.value.length).toFixed(2))
  })
  const medianVote = computed(() => {
    if (numericVotes.value.length === 0) {
      return null
    }
    const sorted = numericVotes.value.toSorted((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
  })
  const stats = computed<RoundStats | null>(() => {
    if (!showVotes.value || revealedVotes.value.length === 0) {
      return null
    }

    const counts = countVotes(revealedVotes.value)
    const uniqueVoteCount = Object.keys(counts).length
    const maxCount = Math.max(...Object.values(counts))
    const nums = numericVotes.value
    const hasNumericVotes = nums.length > 0
    const min = hasNumericVotes ? Math.min(...nums) : null
    const max = hasNumericVotes ? Math.max(...nums) : null
    const spread = min != null && max != null ? max - min : null
    const numericCounts = countVotes(nums)

    let closest: number | null = null
    if (averageVote.value != null) {
      closest = deckNums.value[0] ?? nums[0] ?? 0
      let bestDistance = Math.abs(averageVote.value - closest)
      for (const num of deckNums.value) {
        const distance = Math.abs(averageVote.value - num)
        if (distance < bestDistance - 1e-9) {
          closest = num
          bestDistance = distance
        } else if (Math.abs(distance - bestDistance) < 1e-9 && num > closest) {
          closest = num
        }
      }
    }

    const isCloseNumericVote = nums.length === revealedVotes.value.length
      && spread != null
      && spread <= 3
      && Object.keys(numericCounts).length <= 2

    return {
      avg: averageVote.value,
      median: medianVote.value,
      closest,
      min,
      max,
      spread,
      counts,
      maxCount,
      total: revealedVotes.value.length,
      numericTotal: nums.length,
      consensus: uniqueVoteCount === 1 ? 'consensus' : (isCloseNumericVote ? 'close' : 'split'),
    }
  })

  function subscribeToRoom (roomId: string | null) {
    unsubscribeRoom?.()
    unsubscribeUsers?.()
    unsubscribeRoom = null
    unsubscribeUsers = null
    activeRoomId.value = roomId
    currentRoom.value = null
    roomUsers.value = {}
    roomMissing.value = false

    if (!roomId || !db.value) {
      return
    }

    unsubscribeRoom = onValue(dbRef(db.value, `rooms/${roomId}`), snapshot => {
      const data = snapshot.val()
      currentRoom.value = data
      roomMissing.value = !data
    })

    unsubscribeUsers = onValue(dbRef(db.value, `rooms/${roomId}/users`), snapshot => {
      roomUsers.value = snapshot.val() || {}
    })
  }

  function stop () {
    unsubscribeRoom?.()
    unsubscribeUsers?.()
    unsubscribeRoom = null
    unsubscribeUsers = null
  }

  function castVote (value: VoteValue) {
    if (!db.value || !activeRoomId.value || !effectiveUserId.value || !canVoteInCurrentRound.value) {
      return
    }

    const newVote = value === selectedVote.value ? null : value
    update(dbRef(db.value, `rooms/${activeRoomId.value}/roundParticipants/${effectiveUserId.value}`), { vote: newVote }).catch(console.error)
    update(dbRef(db.value, `rooms/${activeRoomId.value}`), { lastActivity: Date.now() }).catch(console.error)
  }

  function commitVote (value: string) {
    if (!db.value || !activeRoomId.value || !canCommitFinalVote.value) {
      return
    }
    update(dbRef(db.value, `rooms/${activeRoomId.value}`), { committedVote: value, lastActivity: Date.now() }).catch(console.error)
  }

  return {
    activeRoomId,
    canCommitFinalVote,
    canVoteInCurrentRound,
    castVote,
    commitVote,
    committedVote,
    currentRoom,
    displayVoteCounts,
    formatNum,
    historyEnabled,
    roomMissing,
    selectedVote,
    showVotes,
    stats,
    stop,
    subscribeToRoom,
    userName: effectiveUserName,
    voteActionHint,
    voteOptions,
  }
}
