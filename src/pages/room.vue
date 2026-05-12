<template>
  <template v-if="currentRoom && !!userName">
    <div class="shell">
      <!-- Backdrop for mobile sidebar overlay -->
      <div v-if="sidePanelEnabled && historyPanelOpen" class="panel-backdrop" @click="historyPanelOpen = false" />

      <RoomSidePanel
        v-if="sidePanelEnabled"
        v-model:open="historyPanelOpen"
        :can-restore-history="canRestoreHistoryEntry"
        :current-task="currentTask"
        :history="sessionHistory"
        :history-enabled="historyEnabled"
        :restore-history-title="restoreHistoryActionTitle"
        :task-information-enabled="taskInfoVisible"
        @restore-history="restoreHistoryEntry"
      />

      <main class="main">
        <div class="main-head">
          <div class="main-head-left">
            <v-btn
              v-if="sidePanelEnabled"
              :aria-label="historyPanelOpen ? 'Close panel' : 'Open room panel'"
              class="icon-btn mobile-panel-btn"
              density="compact"
              icon
              :title="historyPanelOpen ? 'Close panel' : 'Open room panel'"
              variant="text"
              @click="roomCommands.toggleSidePanel()"
            >
              <v-icon :icon="historyPanelOpen ? 'mdi-backburger' : 'mdi-menu'" size="16" />
            </v-btn>

            <v-btn
              aria-label="Back to lobby"
              class="icon-btn"
              density="compact"
              icon
              title="Back to lobby"
              variant="text"
              @click="roomCommands.goToLobby()"
            >
              <v-icon icon="mdi-home-outline" size="16" />
            </v-btn>

            <p class="room-name-label">{{ currentRoom.name }}</p>

            <span aria-hidden="true" class="room-title-separator">•</span>

            <a
              v-if="currentTask?.title && currentTask?.url"
              class="round-counter round-title-link"
              :href="currentTask.url"
              rel="noreferrer"
              target="_blank"
              :title="currentTask.url"
            >
              {{ currentTask.title }}
            </a>

            <span v-else class="round-counter" :class="{ 'round-title-text': !!currentTask?.title }">
              {{ currentRoundLabel }}
            </span>
          </div>

          <div class="main-head-right">
            <div class="progress-pill">
              <span class="progress-dots">
                <span
                  v-for="player in sortedRoomUsers"
                  :key="player.userId"
                  class="pdot"
                  :class="{ done: player.vote != null }"
                  :title="player.name"
                />
              </span>

              <span class="vote-count">{{ votedCount }}/{{ totalPlayers }} voted</span>
            </div>

            <v-btn
              :aria-label="configStore.viewMode === 'table' ? 'Switch to grid view' : 'Switch to table view'"
              class="icon-btn"
              density="compact"
              icon
              :title="configStore.viewMode === 'table' ? 'Switch to grid view' : 'Switch to table view'"
              variant="text"
              @click="configStore.setViewMode(configStore.viewMode === 'table' ? 'grid' : 'table')"
            >
              <v-icon :icon="configStore.viewMode === 'table' ? 'mdi-table' : 'mdi-cards-playing'" size="16" />
            </v-btn>

            <v-btn
              v-if="taskInformationEnabled && currentTask"
              aria-label="Edit task information"
              class="icon-btn"
              density="compact"
              :disabled="!canEditCurrentTask"
              icon
              :title="editTaskActionTitle"
              variant="text"
              @click="startTaskInfoFlow('current')"
            >
              <v-icon icon="mdi-pencil-outline" size="16" />
            </v-btn>

            <v-btn
              aria-label="Room settings"
              class="icon-btn"
              density="compact"
              :disabled="leaderModeEnabled && !isLeader"
              icon
              :title="leaderModeEnabled && !isLeader ? 'Only the leader can change room settings' : 'Room settings'"
              variant="text"
              @click="roomConfigOpen = true"
            >
              <v-icon icon="mdi-tune" size="16" />
            </v-btn>

            <v-btn
              :aria-label="shareCopied ? 'Copied!' : 'Share room link'"
              class="icon-btn"
              density="compact"
              :disabled="!firebaseConfig"
              icon
              :title="shareCopied ? 'Copied!' : 'Copy room + config link'"
              variant="text"
              @click="roomCommands.copyRoomLink()"
            >
              <v-icon :icon="shareCopied ? 'mdi-check' : 'mdi-share-variant'" size="16" />
            </v-btn>
          </div>
        </div>

        <RoomConfigModal
          v-if="currentRoom"
          v-model="roomConfigOpen"
          :current-settings="{
            name: currentRoom.name,
            deck: currentRoom.settings?.deck ?? 'fibonacci',
            customDeck: currentRoom.settings?.customDeck ?? '',
            specialQuestion: currentRoom.settings?.specialQuestion !== false,
            specialCoffee: currentRoom.settings?.specialCoffee !== false,
            historyEnabled: currentRoom.settings?.historyEnabled !== false,
            leaderModeEnabled: currentRoom.settings?.leaderModeEnabled === true,
            taskInformationEnabled: currentRoom.settings?.taskInformationEnabled === true,
          }"
          @save="applyRoomConfig"
        />

        <TaskInfoModal
          v-model="taskInfoModalOpen"
          :initial-task="taskDraftInitialValue"
          :message="taskInfoModalMessage"
          :submit-label="taskInfoModalSubmitLabel"
          :title="taskInfoModalTitle"
          @save="saveTaskInformation"
        />

        <SimpleResultsGrid
          v-if="configStore.viewMode === 'grid'"
          :current-user-id="configStore.userId"
          :leader-user-id="leaderUserId"
          :players="sortedRoomUsers"
          :show-votes="showVotes"
          @open-player-menu="openPlayerMenu"
        />

        <PokerTable
          v-else
          :current-user-id="configStore.userId"
          :leader-user-id="leaderUserId"
          :players="sortedRoomUsers"
          :shaking-user-ids="shakingUserIds"
          :show-votes="showVotes"
          @open-player-menu="openPlayerMenu"
        />

        <div class="action-row room-action-row">
          <template v-if="taskInformationEnabled && !currentTask">
            <v-btn
              class="p0-btn p0-btn-primary"
              :disabled="!canStartTaskInfoFlow"
              prepend-icon="mdi-text-box-plus-outline"
              :title="roundActionTitle"
              variant="flat"
              @click="startTaskInfoFlow('current')"
            >
              Start round
            </v-btn>
          </template>

          <template v-else-if="!showVotes">
            <v-btn
              class="p0-btn p0-btn-primary"
              :disabled="votedCount === 0 || !canManageRound"
              prepend-icon="mdi-eye"
              :title="roundActionTitle"
              variant="flat"
              @click="roomCommands.revealVotes()"
            >
              Reveal votes
              <span v-if="!allVoted" class="button-meta">
                {{ votedCount }}/{{ totalPlayers }}
              </span>
            </v-btn>

            <v-btn
              class="p0-btn p0-btn-ghost"
              :disabled="!canManageRound"
              :title="roundActionTitle"
              variant="flat"
              @click="roomCommands.resetRound()"
            >
              Reset round
            </v-btn>
          </template>

          <template v-else-if="showVotes">
            <v-btn
              class="p0-btn p0-btn-ghost"
              :disabled="!canManageRound"
              prepend-icon="mdi-eye-off"
              :title="roundActionTitle"
              variant="flat"
              @click="roomCommands.hideVotes()"
            >
              Hide votes
            </v-btn>

            <v-btn
              class="p0-btn p0-btn-primary"
              :disabled="!canManageRound"
              :prepend-icon="historyEnabled ? 'mdi-arrow-right' : 'mdi-refresh'"
              :title="roundActionTitle"
              variant="flat"
              @click="roomCommands.advanceRound()"
            >
              {{ historyEnabled ? 'Next round' : 'New round' }}
            </v-btn>
          </template>
        </div>

        <div v-if="showVotes && committedVote" class="committed-vote-center">
          <div class="committed-vote-badge">
            <v-icon icon="mdi-check-circle" size="14" />
            Final: <strong>{{ committedVote }}</strong>
          </div>
        </div>

        <VoteDock
          v-model:collapsed="dockCollapsed"
          :can-commit-vote="canCommitFinalVote"
          :can-vote="canVoteInCurrentRound"
          :committed-vote="committedVote"
          :disabled-hint="voteActionHint"
          :display-vote-counts="displayVoteCounts"
          :history-enabled="currentRoom?.settings?.historyEnabled !== false"
          :selected-vote="selectedVote"
          :show-votes="showVotes"
          :stats="stats"
          :user-name="userName"
          :vote-options="voteOptions"
          @cast-vote="castVote"
          @commit-vote="onCommitVote"
        />

        <div
          v-if="playerMenu"
          class="room-context-menu"
          :style="{ left: `${playerMenu.x}px`, top: `${playerMenu.y}px` }"
          @click.stop
        >
          <button
            class="room-context-menu-item"
            type="button"
            @click="transferLeadership(playerMenu.userId)"
          >
            Make {{ playerMenu.name }} leader
          </button>
        </div>
      </main>
    </div>

    <ConfettiBurst
      v-if="showConfetti"
      :pieces="confettiPieces"
    />
  </template>

  <v-container v-else class="setup-screen" fluid>
    <v-card class="setup-card" flat>
      <div class="kicker">Room</div>
      <h1 class="setup-title">{{ roomNotFound ? 'Room not found' : 'Loading room' }}</h1>

      <p class="setup-desc">
        {{ roomNotFound ? 'This room could not be found. You will be redirected shortly.' : 'Connecting to the room.' }}
      </p>
    </v-card>
  </v-container>

  <v-snackbar v-model="roomNotFound" color="error" :timeout="-1">
    Room not found. Redirecting...
  </v-snackbar>

</template>

<script lang="ts" setup>
  import type { RoomHistoryEntry, RoomHistoryVoteSnapshot, RoomRecord, RoomUser, RoundEditLock, TaskInfo, VoteValue } from '@/types/room'
  import { ref as dbRef, onDisconnect, onValue, runTransaction, update } from 'firebase/database'
  import { storeToRefs } from 'pinia'
  import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import ConfettiBurst from '@/components/ConfettiBurst.vue'
  import PokerTable from '@/components/PokerTable.vue'
  import RoomConfigModal from '@/components/RoomConfigModal.vue'
  import RoomSidePanel from '@/components/RoomSidePanel.vue'
  import SimpleResultsGrid from '@/components/SimpleResultsGrid.vue'
  import TaskInfoModal from '@/components/TaskInfoModal.vue'
  import VoteDock from '@/components/VoteDock.vue'
  import { useAppStore } from '@/stores/app'
  import { useConfigStore } from '@/stores/config'
  import { copyText } from '@/utils/clipboard'
  import { hasActiveOverlay, registerKeyboardShortcuts } from '@/utils/keyboardShortcuts'

  const route = useRoute()
  const router = useRouter()
  const appStore = useAppStore()
  const configStore = useConfigStore()
  const roomId = route.params.roomId as string

  type ConsensusState = 'consensus' | 'close' | 'split'
  type TaskFlowMode = 'current' | 'next'
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

  const PRESET_DECKS: Record<string, VoteValue[]> = {
    fibonacci: [0, 1, 2, 3, 5, 8, 13, 21, 34, 55],
    linear: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15],
    tshirt: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  }
  const VOTE_SHORTCUT_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'] as const

  function parseCustomDeck (raw: string): VoteValue[] {
    return raw.split(',').flatMap(s => {
      const t = s.trim()
      if (!t) return []
      const n = Number(t)
      return [Number.isNaN(n) ? t : n]
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

  const { userName, firebaseConfig } = storeToRefs(configStore)

  const currentRoom = ref<RoomRecord | null>(null)
  const roomUsers = ref<Record<string, RoomUser>>({})

  const db = configStore.getDb()
  const roomNotFound = ref(false)
  const dockCollapsed = ref(false)
  const shareCopied = ref(false)
  const roomConfigOpen = ref(false)
  const playerMenu = ref<{ userId: string, name: string, x: number, y: number } | null>(null)
  const taskInfoModalOpen = ref(false)
  const pendingTaskFlow = ref<TaskFlowMode | null>(null)

  const committedVote = computed(() => currentRoom.value?.committedVote ?? null)
  const currentTask = computed<TaskInfo | null>(() => currentRoom.value?.currentTask ?? null)
  const showConfetti = ref(false)
  const shakingUserIds = ref<string[]>([])
  const previousVotes = ref<Record<string, VoteValue | null>>({})
  const confettiPieces = ref<Array<{
    id: string
    left: number
    bg: string
    delay: number
    duration: number
    rotation: number
    shape: string
  }>>([])

  // Synced from config store so the panel toggle is persisted across sessions
  const historyPanelOpen = computed({
    get: () => configStore.historyPanelOpen,
    set: v => configStore.setHistoryPanelOpen(v),
  })

  let hasAutoJoined = false
  let hasSavedRoom = false
  let redirectTimeout: ReturnType<typeof setTimeout> | null = null
  let roundStartTime = Date.now()
  let unsubscribeRoom: (() => void) | null = null
  let unsubscribeUsers: (() => void) | null = null
  let unsubscribeHistory: (() => void) | null = null
  let unregisterShortcuts: (() => void) | null = null

  const showVotes = computed(() => currentRoom.value?.settings?.showVotes === true)
  const historyEnabled = computed(() => currentRoom.value?.settings?.historyEnabled !== false)
  const leaderModeEnabled = computed(() => currentRoom.value?.settings?.leaderModeEnabled === true)
  const taskInformationEnabled = computed(() => currentRoom.value?.settings?.taskInformationEnabled === true)
  const taskInfoVisible = computed(() => taskInformationEnabled.value || !!currentTask.value)
  const sidePanelEnabled = computed(() => historyEnabled.value || taskInfoVisible.value)
  const leaderUserId = computed(() => currentRoom.value?.leaderUserId ?? null)
  const createdByUserId = computed(() => currentRoom.value?.createdByUserId ?? currentRoom.value?.createdBy ?? null)
  const isLeader = computed(() => !leaderModeEnabled.value || (!!configStore.userId && leaderUserId.value === configStore.userId))
  const roundEditLock = computed<RoundEditLock | null>(() => currentRoom.value?.roundEditLock ?? null)
  const isRoundLockedByMe = computed(() => !!configStore.userId && roundEditLock.value?.userId === configStore.userId)
  const isRoundLockedByOther = computed(() => !!roundEditLock.value && !isRoundLockedByMe.value)
  const canManageRound = computed(() => (!leaderModeEnabled.value || isLeader.value) && !isRoundLockedByOther.value)
  const canCommitFinalVote = computed(() => !leaderModeEnabled.value || isLeader.value)
  const canStartTaskInfoFlow = computed(() => (!leaderModeEnabled.value || isLeader.value) && !isRoundLockedByOther.value)
  const canEditCurrentTask = computed(() =>
    taskInformationEnabled.value
    && !!currentTask.value
    && ((!leaderModeEnabled.value || isLeader.value) && !isRoundLockedByOther.value),
  )
  const canRestoreHistoryEntry = computed(() => canManageRound.value)
  const currentRound = computed(() => currentRoom.value?.roundNumber ?? (sessionHistory.value.length + 1))
  const currentRoundLabel = computed(() => currentTask.value?.title || `Round ${currentRound.value}`)
  const roundActionTitle = computed(() => {
    if (leaderModeEnabled.value && !isLeader.value) return 'Only the leader can control the round'
    if (isRoundLockedByOther.value) return `${roundEditLock.value?.userName ?? 'Another participant'} is entering task information`
    if (taskInformationEnabled.value && !currentTask.value) return 'Enter task information to start this round'
    return ''
  })
  const editTaskActionTitle = computed(() => {
    if (leaderModeEnabled.value && !isLeader.value) return 'Only the leader can edit task information'
    if (isRoundLockedByOther.value) return `${roundEditLock.value?.userName ?? 'Another participant'} is editing task information`
    return 'Edit task information'
  })
  const restoreHistoryActionTitle = computed(() => {
    if (leaderModeEnabled.value && !isLeader.value) return 'Only the leader can restore a previous round'
    if (isRoundLockedByOther.value) return `${roundEditLock.value?.userName ?? 'Another participant'} is editing task information`
    return 'Restore this round for re-voting'
  })
  const voteActionHint = computed(() => {
    if (leaderModeEnabled.value && !isLeader.value) return 'Waiting for the leader to manage this round'
    if (isRoundLockedByOther.value) return `${roundEditLock.value?.userName ?? 'Another participant'} is entering task information`
    if (taskInformationEnabled.value && !currentTask.value) return 'Task information is required before anyone can vote'
    return ''
  })
  const canVoteInCurrentRound = computed(() =>
    !showVotes.value
    && !isRoundLockedByOther.value
    && (!taskInformationEnabled.value || !!currentTask.value),
  )
  const taskDraftInitialValue = computed<TaskInfo | null>(() =>
    pendingTaskFlow.value === 'current' ? currentTask.value : null,
  )
  const taskInfoModalTitle = computed(() => {
    if (pendingTaskFlow.value === 'next') return historyEnabled.value ? 'Start the next round' : 'Start a new round'
    return currentTask.value ? 'Update task information' : 'Start the current round'
  })
  const taskInfoModalMessage = computed(() =>
    pendingTaskFlow.value === 'next'
      ? 'Task title and URL are required before the next estimation round begins.'
      : 'Add the task this room is currently estimating so everyone sees the same context.',
  )
  const taskInfoModalSubmitLabel = computed(() =>
    pendingTaskFlow.value === 'next' ? 'Start round' : 'Save task information',
  )

  const voteOptions = computed((): VoteValue[] => {
    const s = currentRoom.value?.settings
    let base: VoteValue[]
    if (s?.deck === 'custom') {
      base = parseCustomDeck(s.customDeck ?? '')
      if (base.length === 0) base = [...PRESET_DECKS.fibonacci]
    } else {
      base = [...(PRESET_DECKS[s?.deck ?? 'fibonacci'] ?? PRESET_DECKS.fibonacci)]
    }
    if (s?.specialQuestion !== false) base.push('?')
    if (s?.specialCoffee !== false) base.push('☕')
    return base
  })

  const deckNums = computed(() =>
    voteOptions.value.filter((v): v is number => typeof v === 'number'),
  )

  const revealedVotes = computed(() =>
    Object.values(roomUsers.value)
      .map(user => user.vote)
      .filter((vote): vote is VoteValue => vote != null),
  )

  // All vote values (including ?, ☕) with their counts — used for insights deck display
  const displayVoteCounts = computed((): Record<string, number> | null => {
    if (!showVotes.value) return null
    const counts = countVotes(revealedVotes.value)
    return Object.keys(counts).length > 0 ? counts : null
  })
  const historyShortcutVoteValues = computed(() => {
    const counts = displayVoteCounts.value
    if (!counts) return []

    const presentValues = new Set(Object.keys(counts))
    const orderedDeckValues = voteOptions.value
      .map(String)
      .filter(value => presentValues.has(value))
    const extraValues = Object.keys(counts).filter(value => !orderedDeckValues.includes(value))
    return [...orderedDeckValues, ...extraValues]
  })
  const voteShortcutLookup = computed(() => {
    const availableValues = showVotes.value
      ? historyShortcutVoteValues.value
      : (dockCollapsed.value ? [] : voteOptions.value.map(String))

    const lookup: Record<string, string> = {}
    const standardValues = availableValues.filter(value => value !== '?' && value !== '☕')
    for (const [index, value] of standardValues.slice(0, VOTE_SHORTCUT_KEYS.length).entries()) {
      lookup[VOTE_SHORTCUT_KEYS[index]] = value
    }
    if (availableValues.includes('?')) lookup['-'] = '?'
    if (availableValues.includes('☕')) lookup['+'] = '☕'
    return lookup
  })

  const votedCount = computed(() =>
    Object.values(roomUsers.value).filter(user => user.vote != null).length,
  )
  const totalPlayers = computed(() => Object.keys(roomUsers.value).length)
  const allVoted = computed(() => votedCount.value > 0 && votedCount.value === totalPlayers.value)
  const selectedVote = computed(() => {
    if (!configStore.userId || !roomUsers.value[configStore.userId]) return null
    return roomUsers.value[configStore.userId].vote ?? null
  })

  const sortedRoomUsers = computed(() =>
    Object.entries(roomUsers.value)
      .map(([userId, user]) => ({ userId, ...user }))
      .toSorted((a, b) => a.joinedAt - b.joinedAt),
  )

  const numericVotes = computed(() =>
    revealedVotes.value
      .filter((vote): vote is number => typeof vote === 'number'),
  )

  const averageVote = computed(() => {
    if (numericVotes.value.length === 0) return null
    const sum = numericVotes.value.reduce((acc, val) => acc + val, 0)
    return Number.parseFloat((sum / numericVotes.value.length).toFixed(2))
  })

  const medianVote = computed(() => {
    if (numericVotes.value.length === 0) return null
    const sorted = numericVotes.value.toSorted((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
  })

  const unanimousVote = computed(() => {
    if (revealedVotes.value.length === 0) return null
    const values = Object.keys(countVotes(revealedVotes.value))
    return values.length === 1 ? values[0] : null
  })

  const stats = computed<RoundStats | null>(() => {
    if (!showVotes.value || revealedVotes.value.length === 0) return null

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
    const consensus: ConsensusState = uniqueVoteCount === 1
      ? 'consensus'
      : (isCloseNumericVote ? 'close' : 'split')

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
      consensus,
    }
  })

  const defaultFinalVote = computed(() => {
    if (committedVote.value) return committedVote.value
    if (unanimousVote.value) return unanimousVote.value
    if (averageVote.value === null) return null
    return formatNum(averageVote.value)
  })

  const sessionHistory = ref<RoomHistoryEntry[]>([])

  watch(userName, newName => {
    if (!currentRoom.value || !db || !configStore.userId) return
    const userRef = dbRef(db, `rooms/${roomId}/users/${configStore.userId}`)
    update(userRef, {
      name: newName || 'Anonymous',
      avatarSeed: configStore.avatarSeed || newName || 'Guest',
    }).catch(console.error)
  })

  // When the global username modal (App.vue) sets a name after the room loaded,
  // auto-join so the user appears on the table without a page reload.
  watch(userName, newName => {
    if (newName && !hasAutoJoined && currentRoom.value) {
      hasAutoJoined = true
      joinRoom()
    }
  })

  // Sync avatar style/seed/bg to Firebase whenever the user changes them
  watch(
    [() => configStore.avatarStyle, () => configStore.avatarSeed, () => configStore.avatarBg],
    () => {
      if (!db || !configStore.userId || !currentRoom.value) return
      update(dbRef(db, `rooms/${roomId}/users/${configStore.userId}`), {
        avatarStyle: configStore.avatarStyle,
        avatarSeed: configStore.avatarSeed || userName.value || 'Guest',
        avatarBg: configStore.avatarBg,
      }).catch(console.error)
    },
  )

  watch(() => currentRoom.value?.name, newName => {
    if (newName && hasSavedRoom) configStore.updateRecentRoomName(roomId, newName)
  })

  watch(sidePanelEnabled, enabled => {
    if (!enabled) historyPanelOpen.value = false
  })

  watch([currentRoom, roomUsers], () => {
    if (!currentRoom.value) return
    appStore.setRoomInfo(roomId, currentRoom.value.name, totalPlayers.value)
  }, { deep: true })

  watch(showVotes, (revealed, wasRevealed) => {
    if (revealed && !wasRevealed) {
      setTimeout(() => {
        if (stats.value?.consensus === 'consensus' && stats.value.total >= 2) {
          triggerConfetti()
        }
      }, 900)
    }
  })

  watch(roomUsers, newUsers => {
    for (const [userId, user] of Object.entries(newUsers)) {
      const prev = previousVotes.value[userId]
      const curr = user.vote ?? null
      if (prev != null && curr != null && prev !== curr) {
        triggerShakeForUser(userId)
      }
    }
    const snapshot: Record<string, VoteValue | null> = {}
    for (const [userId, user] of Object.entries(newUsers)) {
      snapshot[userId] = user.vote ?? null
    }
    previousVotes.value = snapshot
  }, { deep: true })

  onMounted(() => {
    if (!db) return

    window.addEventListener('click', closePlayerMenu)
    window.addEventListener('keydown', onWindowKeydown)
    unregisterShortcuts = registerKeyboardShortcuts([
      {
        id: 'room.vote-card',
        group: 'voting',
        description: 'Select a vote card or final estimate',
        keys: [
          ...VOTE_SHORTCUT_KEYS.map(key => ({ key })),
          { key: '-' },
          { key: '-', code: 'NumpadSubtract' },
          { key: '+' },
          { code: 'NumpadAdd' },
        ],
        when: () => canUseRoomShortcuts() && canTriggerVoteShortcut(),
        handler: event => {
          const key = event.code === 'NumpadAdd'
            ? '+'
            : (event.code === 'NumpadSubtract'
              ? '-'
              : event.key)
          const vote = voteShortcutLookup.value[key]
          if (!vote) return
          if (showVotes.value) onCommitVote(vote)
          else castVote(parseShortcutVoteValue(vote))
        },
      },
      {
        id: 'room.toggle-deck',
        group: 'voting',
        description: 'Collapse or expand the vote dock',
        keys: [{ key: 'd' }],
        when: () => canUseRoomShortcuts() && currentRoom.value !== null,
        handler: () => {
          roomCommands.toggleDeck()
        },
      },
      {
        id: 'room.copy-link',
        group: 'room',
        description: 'Copy the room link',
        keys: [{ key: 'c' }],
        when: () => canUseRoomShortcuts() && !!firebaseConfig.value,
        handler: () => {
          roomCommands.copyRoomLink()
        },
      },
      {
        id: 'room.reveal-votes',
        group: 'room',
        description: 'Reveal votes',
        keys: [{ key: 'v' }],
        when: () => canUseRoomShortcuts() && !showVotes.value,
        handler: () => {
          roomCommands.revealVotes()
        },
      },
      {
        id: 'room.hide-votes',
        group: 'room',
        description: 'Hide votes',
        keys: [{ key: 'h' }],
        when: () => canUseRoomShortcuts() && showVotes.value,
        handler: () => {
          roomCommands.hideVotes()
        },
      },
      {
        id: 'room.reset-round',
        group: 'room',
        description: 'Reset the current round',
        keys: [{ key: 'r' }],
        when: () => canUseRoomShortcuts(),
        handler: () => {
          roomCommands.resetRound()
        },
      },
      {
        id: 'room.advance-round',
        group: 'room',
        description: 'Start the next round',
        keys: [{ key: 'n' }],
        when: () => canUseRoomShortcuts() && showVotes.value,
        handler: () => {
          roomCommands.advanceRound()
        },
      },
      {
        id: 'room.toggle-panel',
        group: 'navigation',
        description: 'Open or close the room side panel',
        keys: [{ key: 'p' }],
        when: () => canUseRoomShortcuts() && sidePanelEnabled.value,
        handler: () => {
          roomCommands.toggleSidePanel()
        },
      },
      {
        id: 'room.go-home',
        group: 'navigation',
        description: 'Return to the lobby',
        keys: [{ key: 'g' }],
        when: () => canUseRoomShortcuts(),
        handler: () => {
          roomCommands.goToLobby()
        },
      },
    ])

    const roomRef = dbRef(db, `rooms/${roomId}`)
    unsubscribeRoom = onValue(roomRef, snapshot => {
      const data = snapshot.val()

      if (!data) {
        roomNotFound.value = true
        currentRoom.value = null
        configStore.setActiveRoom(null, null)
        appStore.setRoomInfo(null, '', 0)
        redirectTimeout = setTimeout(() => router.replace('/'), 3000)
        return
      }

      roomNotFound.value = false
      currentRoom.value = data
      configStore.setActiveRoom(roomId, data.name)
      appStore.setRoomInfo(roomId, data.name, totalPlayers.value)
      if (!taskInformationEnabled.value && taskInfoModalOpen.value) {
        taskInfoModalOpen.value = false
        pendingTaskFlow.value = null
      }

      if (!hasSavedRoom) {
        hasSavedRoom = true
        configStore.saveRecentRoom(roomId, data.name)
      }

      if (!hasAutoJoined && userName.value) {
        hasAutoJoined = true
        joinRoom()
      }
    })

    const usersRef = dbRef(db, `rooms/${roomId}/users`)
    unsubscribeUsers = onValue(usersRef, snapshot => {
      roomUsers.value = snapshot.val() || {}
    })

    const historyRef = dbRef(db, `rooms/${roomId}/history`)
    unsubscribeHistory = onValue(historyRef, snapshot => {
      const data = snapshot.val()
      if (!data) {
        sessionHistory.value = []
        return
      }
      sessionHistory.value = (Object.values(data) as typeof sessionHistory.value)
        .toSorted((a, b) => a.round - b.round)
    })
  })

  onUnmounted(() => {
    window.removeEventListener('click', closePlayerMenu)
    window.removeEventListener('keydown', onWindowKeydown)
    unregisterShortcuts?.()
    unsubscribeRoom?.()
    unsubscribeUsers?.()
    unsubscribeHistory?.()
    if (redirectTimeout !== null) clearTimeout(redirectTimeout)
    void releaseRoundEditLock()
  })

  function formatNum (num: number | null | undefined): string {
    if (num == null) return '-'
    return Number.isInteger(num) ? String(num) : String(Number.parseFloat(num.toFixed(2)))
  }

  function formatOptionalNum (num: number | null | undefined): string | null {
    if (num === null || num === undefined) return null
    return formatNum(num)
  }

  function parseStoredVote (vote: string | VoteValue): VoteValue {
    if (typeof vote !== 'string') return vote
    const trimmed = vote.trim()
    if (!trimmed) return vote
    const parsed = Number(trimmed)
    return Number.isNaN(parsed) ? vote : parsed
  }

  function buildLegacyVotes (): Record<string, string> {
    const votes: Record<string, string> = {}
    for (const user of Object.values(roomUsers.value)) {
      if (user.vote != null) votes[user.name] = String(user.vote)
    }
    return votes
  }

  function buildVoteSnapshots (): Record<string, RoomHistoryVoteSnapshot> {
    const snapshots: Record<string, RoomHistoryVoteSnapshot> = {}
    for (const [userId, user] of Object.entries(roomUsers.value)) {
      if (user.vote == null) continue
      snapshots[userId] = {
        name: user.name,
        vote: user.vote,
      }
    }
    return snapshots
  }

  function buildHistoryEntryBase () {
    const id = String(Date.now())
    const durationMs = Date.now() - roundStartTime
    const completedAt = Date.now()

    return {
      id,
      durationMs,
      completedAt,
      votes: buildLegacyVotes(),
      voteSnapshots: buildVoteSnapshots(),
    }
  }

  function closePlayerMenu () {
    playerMenu.value = null
  }

  function onWindowKeydown (event: KeyboardEvent) {
    if (event.key === 'Escape') closePlayerMenu()
  }

  function canUseRoomShortcuts (): boolean {
    return currentRoom.value !== null
      && !hasActiveOverlay()
      && !roomConfigOpen.value
      && !taskInfoModalOpen.value
      && playerMenu.value === null
  }

  function canTriggerVoteShortcut (): boolean {
    if (showVotes.value) return !dockCollapsed.value && historyEnabled.value && canCommitFinalVote.value
    return !dockCollapsed.value && canVoteInCurrentRound.value
  }

  function parseShortcutVoteValue (value: string): VoteValue {
    const numericValue = Number(value)
    return Number.isNaN(numericValue) ? value : numericValue
  }

  function joinRoom () {
    if (!db || !configStore.userId) return
    const userRef = dbRef(db, `rooms/${roomId}/users/${configStore.userId}`)
    update(userRef, {
      name: userName.value || 'Anonymous',
      joinedAt: Date.now(),
      avatarStyle: configStore.avatarStyle,
      avatarSeed: configStore.avatarSeed || userName.value || 'Guest',
      avatarBg: configStore.avatarBg,
    }).catch(console.error)
    onDisconnect(userRef).remove()
  }

  async function shareRoomConfig () {
    if (!firebaseConfig.value) return

    const encoded = btoa(JSON.stringify(firebaseConfig.value))
    const url = `${window.location.origin}${import.meta.env.BASE_URL}rooms/${encodeURIComponent(roomId)}?config=${encodeURIComponent(encoded)}`
    const ok = await copyText(url)

    if (ok) {
      shareCopied.value = true
      appStore.showToast('Room link with config copied.', 'success')
      setTimeout(() => {
        shareCopied.value = false
      }, 2000)
    } else {
      appStore.showToast('Copy failed. Your browser blocked clipboard access.', 'error')
    }
  }

  function triggerShakeForUser (userId: string) {
    shakingUserIds.value = shakingUserIds.value.filter(id => id !== userId)
    requestAnimationFrame(() => {
      shakingUserIds.value = [...shakingUserIds.value, userId]
      setTimeout(() => {
        shakingUserIds.value = shakingUserIds.value.filter(id => id !== userId)
      }, 500)
    })
  }

  function castVote (value: VoteValue) {
    if (!db || !configStore.userId || !canVoteInCurrentRound.value) return

    closePlayerMenu()

    const isVoteChange = selectedVote.value !== null && value !== selectedVote.value

    const userRef = dbRef(db, `rooms/${roomId}/users/${configStore.userId}`)
    const newVote = value === selectedVote.value ? null : value
    update(userRef, { vote: newVote }).catch(console.error)

    const roomRef = dbRef(db, `rooms/${roomId}`)
    update(roomRef, { lastActivity: Date.now() }).catch(console.error)

    if (isVoteChange && configStore.userId) {
      triggerShakeForUser(configStore.userId)
    }
  }

  function buildNewVoteOptions (settings: {
    deck: 'fibonacci' | 'linear' | 'tshirt' | 'custom'
    customDeck: string
    specialQuestion: boolean
    specialCoffee: boolean
  }): VoteValue[] {
    let base: VoteValue[]
    if (settings.deck === 'custom') {
      base = parseCustomDeck(settings.customDeck)
      if (base.length === 0) base = [...PRESET_DECKS.fibonacci]
    } else {
      base = [...(PRESET_DECKS[settings.deck] ?? PRESET_DECKS.fibonacci)]
    }
    if (settings.specialQuestion) base.push('?')
    if (settings.specialCoffee) base.push('☕')
    return base
  }

  function applyRoomConfig (settings: {
    name: string
    deck: 'fibonacci' | 'linear' | 'tshirt' | 'custom'
    customDeck: string
    specialQuestion: boolean
    specialCoffee: boolean
    historyEnabled: boolean
    leaderModeEnabled: boolean
    taskInformationEnabled: boolean
  }) {
    if (!db || !currentRoom.value) return

    closePlayerMenu()
    const taskInfoWasEnabled = taskInformationEnabled.value

    const newOptions = buildNewVoteOptions(settings)

    const updates: Record<string, unknown> = {
      'name': settings.name,
      'settings/deck': settings.deck,
      'settings/customDeck': settings.deck === 'custom' ? settings.customDeck : null,
      'settings/specialQuestion': settings.specialQuestion,
      'settings/specialCoffee': settings.specialCoffee,
      'settings/historyEnabled': settings.historyEnabled,
      'settings/leaderModeEnabled': settings.leaderModeEnabled,
      'settings/taskInformationEnabled': settings.taskInformationEnabled,
      'leaderUserId': settings.leaderModeEnabled
        ? (leaderUserId.value ?? createdByUserId.value ?? null)
        : null,
      'createdByUserId': createdByUserId.value,
      'lastActivity': Date.now(),
    }

    // Only reset votes that are no longer in the new deck
    const invalidUserIds = Object.entries(roomUsers.value)
      .filter(([, user]) => user.vote != null && !newOptions.includes(user.vote))
      .map(([userId]) => userId)

    if (invalidUserIds.length > 0) {
      for (const userId of invalidUserIds) {
        updates[`users/${userId}/vote`] = null
      }
      if (showVotes.value) {
        updates['settings/showVotes'] = false
      }
    }

    if (!settings.taskInformationEnabled) {
      updates.currentTask = null
      updates.roundEditLock = null
    }

    update(dbRef(db, `rooms/${roomId}`), updates)
      .then(() => {
        if (!taskInfoWasEnabled && settings.taskInformationEnabled && !currentTask.value) {
          return startTaskInfoFlow('current')
        }
        if (taskInfoWasEnabled && !settings.taskInformationEnabled) {
          taskInfoModalOpen.value = false
          pendingTaskFlow.value = null
        }
        return undefined
      })
      .catch(console.error)
  }

  function onCommitVote (value: string) {
    if (!db || !canCommitFinalVote.value) return
    closePlayerMenu()
    update(dbRef(db, `rooms/${roomId}`), { committedVote: value, lastActivity: Date.now() }).catch(console.error)
  }

  function revealVotes () {
    if (!db || !canManageRound.value || (taskInformationEnabled.value && !currentTask.value)) return
    closePlayerMenu()
    const roomRef = dbRef(db, `rooms/${roomId}`)
    update(roomRef, {
      'settings/showVotes': true,
      'lastActivity': Date.now(),
    }).catch(console.error)
  }

  function hideVotes () {
    if (!db || !canManageRound.value) return
    closePlayerMenu()
    const roomRef = dbRef(db, `rooms/${roomId}`)
    update(roomRef, {
      'settings/showVotes': false,
      'committedVote': null,
      'lastActivity': Date.now(),
    }).catch(console.error)
  }

  function resetCurrentRound () {
    if (!db || !canManageRound.value) return

    closePlayerMenu()

    const roomRef = dbRef(db, `rooms/${roomId}`)
    const updates: Record<string, unknown> = {
      'settings/showVotes': false,
      'committedVote': null,
      'lastActivity': Date.now(),
    }

    for (const userId of Object.keys(roomUsers.value)) {
      updates[`users/${userId}/vote`] = null
    }

    update(roomRef, updates).catch(console.error)
  }

  function advanceRound () {
    if (!db || !canManageRound.value) return

    if (taskInformationEnabled.value) {
      void startTaskInfoFlow('next')
      return
    }

    closePlayerMenu()

    const roomRef = dbRef(db, `rooms/${roomId}`)
    const updates: Record<string, unknown> = {
      'settings/showVotes': false,
      'committedVote': null,
      'lastActivity': Date.now(),
    }

    if (showVotes.value && currentRoom.value && historyEnabled.value) {
      const { id, durationMs, completedAt, votes, voteSnapshots } = buildHistoryEntryBase()

      updates[`history/${id}`] = {
        id,
        finalVote: defaultFinalVote.value,
        avg: formatOptionalNum(stats.value?.avg),
        closest: formatOptionalNum(stats.value?.closest),
        round: currentRound.value,
        durationMs,
        completedAt,
        participantCount: totalPlayers.value,
        consensus: stats.value?.consensus === 'consensus' ? 'yes' : 'split',
        votes,
        voteSnapshots,
      }

      roundStartTime = Date.now()
    }

    for (const userId of Object.keys(roomUsers.value)) {
      updates[`users/${userId}/vote`] = null
    }

    update(roomRef, updates).catch(console.error)
  }

  async function startTaskInfoFlow (mode: TaskFlowMode) {
    if (!db || !configStore.userId || !canStartTaskInfoFlow.value) return

    closePlayerMenu()

    const acquired = await acquireRoundEditLock()
    if (!acquired) return

    pendingTaskFlow.value = mode
    taskInfoModalOpen.value = true
  }

  async function acquireRoundEditLock (): Promise<boolean> {
    if (!db || !configStore.userId) return false

    const lockRef = dbRef(db, `rooms/${roomId}/roundEditLock`)
    const userId = configStore.userId
    const userNameValue = userName.value || 'Anonymous'

    try {
      const result = await runTransaction(lockRef, current => {
        if (current && current.userId !== userId) return
        return {
          userId,
          userName: userNameValue,
          acquiredAt: Date.now(),
        }
      })

      if (!result.committed) {
        return false
      }

      const lockValue = result.snapshot.val() as RoundEditLock | null
      if (lockValue?.userId !== userId) {
        return false
      }

      onDisconnect(lockRef).remove()
      return true
    } catch (error) {
      console.error(error)
      return false
    }
  }

  async function releaseRoundEditLock () {
    if (!db || !configStore.userId || !isRoundLockedByMe.value) return

    try {
      await update(dbRef(db, `rooms/${roomId}`), {
        roundEditLock: null,
        lastActivity: Date.now(),
      })
    } catch (error) {
      console.error(error)
    }
  }

  async function saveTaskInformation (task: TaskInfo) {
    if (!db || !currentRoom.value || !pendingTaskFlow.value || !isRoundLockedByMe.value) return

    const roomRef = dbRef(db, `rooms/${roomId}`)
    const updates: Record<string, unknown> = {
      currentTask: task,
      roundEditLock: null,
      lastActivity: Date.now(),
    }

    if (pendingTaskFlow.value === 'next') {
      updates['settings/showVotes'] = false
      updates.committedVote = null
      updates.roundNumber = currentRound.value + 1

      for (const userId of Object.keys(roomUsers.value)) {
        updates[`users/${userId}/vote`] = null
      }

      if (showVotes.value && historyEnabled.value) {
        const { id, durationMs, completedAt, votes, voteSnapshots } = buildHistoryEntryBase()

        updates[`history/${id}`] = {
          id,
          title: currentTask.value?.title ?? null,
          url: currentTask.value?.url ?? null,
          description: currentTask.value?.description ?? null,
          finalVote: defaultFinalVote.value,
          avg: formatOptionalNum(stats.value?.avg),
          closest: formatOptionalNum(stats.value?.closest),
          round: currentRound.value,
          durationMs,
          completedAt,
          participantCount: totalPlayers.value,
          consensus: stats.value?.consensus === 'consensus' ? 'yes' : 'split',
          votes,
          voteSnapshots,
        }

        roundStartTime = Date.now()
      }
    }

    update(roomRef, updates)
      .then(() => {
        taskInfoModalOpen.value = false
        pendingTaskFlow.value = null
      })
      .catch(console.error)
  }

  watch(taskInfoModalOpen, open => {
    if (open) return
    if (pendingTaskFlow.value !== null) {
      void releaseRoundEditLock()
      pendingTaskFlow.value = null
    }
  })

  function restoreHistoryEntry (historyId: string) {
    if (!db || !canRestoreHistoryEntry.value) return

    const entry = sessionHistory.value.find(item => item.id === historyId)
    if (!entry) return

    closePlayerMenu()

    const updates: Record<string, unknown> = {
      'settings/showVotes': false,
      'committedVote': null,
      'lastActivity': Date.now(),
      'currentTask': entry.title
        ? {
          title: entry.title,
          url: entry.url ?? null,
          description: entry.description ?? null,
        }
        : null,
    }

    for (const userId of Object.keys(roomUsers.value)) {
      updates[`users/${userId}/vote`] = null
    }

    if (entry.voteSnapshots && Object.keys(entry.voteSnapshots).length > 0) {
      for (const [userId, snapshot] of Object.entries(entry.voteSnapshots)) {
        if (!roomUsers.value[userId]) continue
        updates[`users/${userId}/vote`] = snapshot.vote
      }
    } else if (entry.votes) {
      for (const [userId, user] of Object.entries(roomUsers.value)) {
        const legacyVote = entry.votes[user.name]
        if (legacyVote === undefined) continue
        updates[`users/${userId}/vote`] = parseStoredVote(legacyVote)
      }
    }

    roundStartTime = Date.now()
    update(dbRef(db, `rooms/${roomId}`), updates).catch(console.error)
  }

  function openPlayerMenu (payload: { userId: string, name: string, x: number, y: number }) {
    if (!leaderModeEnabled.value || !isLeader.value || payload.userId === leaderUserId.value) {
      closePlayerMenu()
      return
    }

    playerMenu.value = payload
  }

  function transferLeadership (userId: string) {
    if (!db || !leaderModeEnabled.value || !isLeader.value || userId === leaderUserId.value) return
    closePlayerMenu()

    update(dbRef(db, `rooms/${roomId}`), {
      leaderUserId: userId,
      lastActivity: Date.now(),
    }).catch(console.error)
  }

  function triggerConfetti () {
    const colors = ['#4f8cff', '#3ecf8e', '#f5b14d', '#f05a5a', '#a78bfa', '#ffffff']
    confettiPieces.value = Array.from({ length: 80 }, (_, index) => ({
      id: `c${index}`,
      left: Math.random() * 100,
      bg: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.4,
      duration: 1.8 + Math.random() * 1.4,
      rotation: Math.random() * 360,
      shape: Math.random() > 0.5 ? '50%' : '2px',
    }))
    showConfetti.value = true
    setTimeout(() => {
      showConfetti.value = false
    }, 3500)
  }

  const roomCommands = {
    toggleDeck () {
      dockCollapsed.value = !dockCollapsed.value
    },
    toggleSidePanel () {
      if (!sidePanelEnabled.value) return
      historyPanelOpen.value = !historyPanelOpen.value
    },
    copyRoomLink () {
      void shareRoomConfig()
    },
    revealVotes,
    hideVotes,
    resetRound: resetCurrentRound,
    advanceRound,
    goToLobby () {
      router.push('/')
    },
  }
</script>
