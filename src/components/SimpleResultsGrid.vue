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
  }

  const props = defineProps<{
    players: GridPlayer[]
    currentUserId: string | null
    showVotes: boolean
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
      :class="{ 'rg-row-you': player.userId === currentUserId }"
    >
      <div class="rg-name-cell">
        <PlayerAvatar
          :avatar-bg="player.avatarBg"
          :avatar-seed="player.avatarSeed || player.name"
          :avatar-style="player.avatarStyle || DEFAULT_AVATAR_STYLE"
          :size="28"
        />

        <span class="rg-name">{{ player.name }}</span>
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
