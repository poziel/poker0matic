<script setup lang="ts">
  import { computed } from 'vue'
  import { DEFAULT_AVATAR_STYLE } from '@/utils/avatarStyles'
  import PlayerAvatar from './PlayerAvatar.vue'

  type VoteValue = number | string

  interface GridPlayer {
    userId: string
    name: string
    joinedAt: number
    vote?: VoteValue
    avatarStyle?: string
    avatarSeed?: string
    avatarBg?: string
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
  <div class="results-grid">
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
      @contextmenu.prevent="emit('open-player-menu', { userId: player.userId, name: player.name, x: $event.clientX, y: $event.clientY })"
    >
      <div class="rg-name-cell">
        <PlayerAvatar
          :avatar-bg="player.avatarBg"
          :avatar-seed="player.avatarSeed || player.name"
          :avatar-style="player.avatarStyle || DEFAULT_AVATAR_STYLE"
          :size="28"
        />

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
