<script setup lang="ts">
  import type { VoteValue } from '@/types/room'
  import type { AvatarCrop } from '@/utils/avatarStyles'
  import RoundStatsPanel from './RoundStatsPanel.vue'
  import SimpleResultsGrid from './SimpleResultsGrid.vue'
  import VoteDock from './VoteDock.vue'

  interface SimpleRoomPlayer {
    userId: string
    name: string
    joinedAt: number
    vote?: VoteValue
    avatarUrl?: string | null
    avatarCrop?: AvatarCrop | null
    isConnected?: boolean
  }

  interface RoundStats {
    avg: number | null
    median: VoteValue | null
    closest: VoteValue | null
    min: VoteValue | null
    max: VoteValue | null
    spread: number | null
    counts: Record<string, number>
    maxCount: number
    total: number
    numericTotal: number
    ordinalTotal: number
    consensus: 'consensus' | 'close' | 'split'
  }

  defineProps<{
    players: SimpleRoomPlayer[]
    currentUserId: string | null
    leaderUserId: string | null
    showVotes: boolean
    selectedVote: VoteValue | null
    userName: string
    voteOptions: readonly VoteValue[]
    canVote: boolean
    disabledHint?: string
    stats: RoundStats | null
    displayVoteCounts?: Record<string, number> | null
    historyEnabled?: boolean
    committedVote?: string | null
    canCommitVote?: boolean
    externalDockActive?: boolean
    shakingUserIds?: string[]
  }>()

  defineEmits<{
    'cast-vote': [value: VoteValue]
    'commit-vote': [value: string]
    'open-player-menu': [payload: { userId: string, name: string, x: number, y: number }]
  }>()
</script>

<template>
  <section class="simple-room-view" data-test-id="room-simple-view">
    <VoteDock
      v-if="!externalDockActive"
      :can-vote="canVote"
      :collapsed="false"
      :disabled-hint="disabledHint"
      external-window
      :selected-vote="selectedVote"
      :show-hint="false"
      :show-votes="showVotes"
      :user-name="userName"
      :vote-options="voteOptions"
      @cast-vote="$emit('cast-vote', $event)"
    />

    <SimpleResultsGrid
      :current-user-id="currentUserId"
      :leader-user-id="leaderUserId"
      :players="players"
      :shaking-user-ids="shakingUserIds"
      :show-votes="showVotes"
      @open-player-menu="$emit('open-player-menu', $event)"
    />

    <RoundStatsPanel
      always-expanded
      :can-commit-vote="canCommitVote"
      :committed-vote="committedVote"
      :display-vote-counts="displayVoteCounts"
      :history-enabled="historyEnabled"
      :stats="stats"
      :vote-options="[...voteOptions]"
      @commit-vote="$emit('commit-vote', $event)"
    />
  </section>
</template>
