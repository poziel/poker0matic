<script setup lang="ts">
  import type { AvatarCrop } from '@/utils/avatarStyles'
  import PlanningCard from './PlanningCard.vue'
  import PlayerAvatar from './PlayerAvatar.vue'

  type VoteValue = number | string

  interface CardWallPlayer {
    userId: string
    name: string
    joinedAt: number
    vote?: VoteValue
    avatarUrl?: string | null
    avatarCrop?: AvatarCrop | null
    isConnected?: boolean
  }

  const props = defineProps<{
    players: CardWallPlayer[]
    showVotes: boolean
    currentUserId: string | null
    shakingUserIds?: string[]
    leaderUserId: string | null
  }>()

  const emit = defineEmits<{
    'open-player-menu': [payload: { userId: string, name: string, x: number, y: number }]
  }>()

  const getPlayerIndex = (userId: string) => props.players.findIndex(player => player.userId === userId)
</script>

<template>
  <div class="playing-field playing-field-table card-wall-view table" data-cstyle="real" data-test-id="room-table">
    <div class="players">
      <div
        v-for="player in players"
        :key="player.userId"
        class="player"
        :class="{
          'is-you': player.userId === currentUserId,
          'is-leader': player.userId === leaderUserId,
          'is-connected': player.isConnected,
        }"
        :data-player-name="player.name"
        data-test-id="room-player"
        @contextmenu.prevent="emit('open-player-menu', { userId: player.userId, name: player.name, x: $event.clientX, y: $event.clientY })"
      >
        <div v-if="player.userId === leaderUserId" class="leader-crown-avatar">
          <v-icon icon="mdi-crown" size="12" />
        </div>

        <div
          class="avatar"
          :class="{ 'has-voted': player.vote != null }"
          :data-reaction-user-id="player.userId"
        >
          <PlayerAvatar
            :avatar-crop="player.avatarCrop"
            :avatar-seed="player.name"
            :avatar-url="player.avatarUrl"
            :size="64"
          />
        </div>

        <PlanningCard
          data-test-id="room-player-card"
          :flip-delay="player.vote != null ? `${getPlayerIndex(player.userId) * 90}ms` : '0ms'"
          :flipped="showVotes && player.vote != null"
          :shaking="shakingUserIds?.includes(player.userId)"
          :value="player.vote ?? null"
        />

        <div
          class="pname"
          :class="{
            voted: player.vote != null,
            you: player.userId === currentUserId,
          }"
        >
          <span>{{ player.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
