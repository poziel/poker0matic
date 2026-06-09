<script setup lang="ts">
  import type { VoteValue } from '@/types/room'

  interface ConsoleRoomPlayer {
    userId: string
    name: string
    joinedAt: number
    vote?: VoteValue
    isConnected?: boolean
  }

  defineProps<{
    players: ConsoleRoomPlayer[]
    currentUserId: string | null
    leaderUserId: string | null
    showVotes: boolean
    roundLabel: string
    votedCount: number
    totalPlayers: number
  }>()

  const formatVote = (vote: VoteValue | null | undefined) => vote == null ? '-' : String(vote)
</script>

<template>
  <section class="console-room-view" data-test-id="room-console-view">
    <div class="console-room-header">
      <span class="console-room-prompt">refinimo</span>
      <span>{{ roundLabel }}</span>
      <span>{{ votedCount }}/{{ totalPlayers }} ready</span>
    </div>

    <div aria-live="polite" class="console-room-feed" role="log">
      <p class="console-room-line console-room-line-system">
        <span class="console-room-prefix">$</span>
        <span>{{ showVotes ? 'reveal --votes' : 'watch --round --players' }}</span>
      </p>

      <p
        v-for="player in players"
        :key="player.userId"
        class="console-room-line"
        :class="{
          'console-room-line-you': player.userId === currentUserId,
          'console-room-line-leader': player.userId === leaderUserId,
          'console-room-line-ready': player.vote != null,
        }"
        :data-player-name="player.name"
        data-test-id="room-console-line"
      >
        <template v-if="showVotes">
          <span class="console-room-status">[ {{ formatVote(player.vote) }} ]</span>
          <span class="console-room-name">{{ player.name }}</span>
          <span>voted {{ formatVote(player.vote) }}</span>
        </template>

        <template v-else-if="player.vote != null">
          <span class="console-room-status">[✓]</span>
          <span class="console-room-name">{{ player.name }}</span>
          <span>is ready.</span>
        </template>

        <template v-else>
          <span class="console-room-status">[●]</span>
          <span class="console-room-name">{{ player.name }}</span>
          <span>is thinking...</span>
        </template>

        <span v-if="player.userId === currentUserId" class="console-room-tag">you</span>
        <span v-if="player.userId === leaderUserId" class="console-room-tag">lead</span>
        <span v-if="player.isConnected" class="console-room-presence">online</span>
      </p>

      <p v-if="players.length === 0" class="console-room-line console-room-line-muted">
        <span class="console-room-status">[ ]</span>
        <span>No players connected.</span>
      </p>
    </div>
  </section>
</template>
