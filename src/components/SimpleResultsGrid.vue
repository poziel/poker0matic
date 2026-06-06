<script setup lang="ts">
  import type { AvatarCrop } from '@/utils/avatarStyles'
  import { computed } from 'vue'
  import PlayerAvatar from './PlayerAvatar.vue'

  type VoteValue = number | string

  interface GridPlayer {
    userId: string
    name: string
    joinedAt: number
    vote?: VoteValue
    avatarUrl?: string | null
    avatarCrop?: AvatarCrop | null
    isConnected?: boolean
  }

  const props = defineProps<{
    players: GridPlayer[]
    currentUserId: string | null
    showVotes: boolean
    leaderUserId: string | null
  }>()

  const emit = defineEmits<{
    'open-player-menu': [payload: { userId: string, name: string, x: number, y: number }]
  }>()

  const sortedPlayers = computed(() =>
    props.players.toSorted((a, b) => a.joinedAt - b.joinedAt),
  )
</script>

<template>
  <div class="results-grid" data-test-id="room-results-grid">
    <div class="rg-header">
      <span>Player</span>
      <span>{{ showVotes ? 'Vote' : 'Status' }}</span>
    </div>

    <div
      v-for="player in sortedPlayers"
      :key="player.userId"
      class="rg-row"
      :class="{
        'rg-row-you': player.userId === currentUserId,
        'rg-row-leader': player.userId === leaderUserId,
        'rg-row-connected': player.isConnected,
      }"
      :data-player-name="player.name"
      data-test-id="room-grid-player"
      @contextmenu.prevent="emit('open-player-menu', { userId: player.userId, name: player.name, x: $event.clientX, y: $event.clientY })"
    >
      <div class="rg-name-cell">
        <span class="rg-avatar-anchor" :data-reaction-user-id="player.userId">
          <PlayerAvatar
            :avatar-crop="player.avatarCrop"
            :avatar-seed="player.name"
            :avatar-url="player.avatarUrl"
            :size="28"
          />
        </span>

        <span class="rg-name">{{ player.name }}</span>

        <span v-if="player.userId === leaderUserId" class="leader-badge leader-badge-inline">
          <v-icon icon="mdi-crown" size="12" />
          <span>Leader</span>
        </span>

        <span v-if="player.userId === currentUserId" class="rg-you-badge">you</span>
      </div>

      <span
        v-if="showVotes && player.vote != null"
        class="rg-vote-value"
        data-test-id="room-grid-vote"
      >
        {{ player.vote }}
      </span>

      <span v-else-if="showVotes" class="rg-vote-empty">—</span>

      <span v-else class="rg-status" :class="player.vote != null ? 'rg-status-voted' : 'rg-status-waiting'">
        {{ player.vote != null ? 'voted' : 'waiting' }}
      </span>
    </div>

    <div v-if="players.length === 0" class="rg-empty">No players</div>
  </div>
</template>
