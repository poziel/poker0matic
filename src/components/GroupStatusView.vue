<script setup lang="ts">
  import type { VoteValue } from '@/types/room'
  import type { AvatarCrop } from '@/utils/avatarStyles'
  import { computed } from 'vue'
  import PlayerAvatar from './PlayerAvatar.vue'

  interface GroupStatusPlayer {
    userId: string
    name: string
    joinedAt: number
    vote?: VoteValue
    avatarUrl?: string | null
    avatarCrop?: AvatarCrop | null
    isConnected?: boolean
  }

  const props = defineProps<{
    players: GroupStatusPlayer[]
    currentUserId: string | null
    leaderUserId: string | null
    showVotes: boolean
    votedCount: number
    totalPlayers: number
  }>()

  const emit = defineEmits<{
    'open-player-menu': [payload: { userId: string, name: string, x: number, y: number }]
  }>()

  const deliberatingPlayers = computed(() => props.players.filter(player => player.vote == null))
  const readyPlayers = computed(() => props.players.filter(player => player.vote != null))
  const readyPercent = computed(() => props.totalPlayers > 0 ? Math.round((props.votedCount / props.totalPlayers) * 100) : 0)

  const formatVote = (vote: VoteValue | null | undefined) => vote == null ? '-' : String(vote)
</script>

<template>
  <section class="group-status-view" data-test-id="room-group-status-view">
    <div aria-hidden="true" class="group-status-meter">
      <span class="group-status-meter-fill" :style="{ width: `${readyPercent}%` }" />
    </div>

    <div class="group-status-board">
      <section class="group-status-zone group-status-zone-deliberating" data-test-id="group-zone-deliberating">
        <div class="group-status-zone-head">
          <span>Deliberating</span>
          <strong>{{ deliberatingPlayers.length }}</strong>
        </div>

        <TransitionGroup class="group-status-roster" name="group-player" tag="div">
          <button
            v-for="player in deliberatingPlayers"
            :key="player.userId"
            class="group-status-player"
            :class="{
              'is-you': player.userId === currentUserId,
              'is-leader': player.userId === leaderUserId,
              'is-connected': player.isConnected,
            }"
            :data-player-name="player.name"
            data-test-id="group-status-player-deliberating"
            type="button"
            @contextmenu.prevent="emit('open-player-menu', { userId: player.userId, name: player.name, x: $event.clientX, y: $event.clientY })"
          >
            <span class="group-status-avatar" :data-reaction-user-id="player.userId">
              <PlayerAvatar
                :avatar-crop="player.avatarCrop"
                :avatar-seed="player.name"
                :avatar-url="player.avatarUrl"
                :size="44"
              />
            </span>

            <span class="group-status-name">{{ player.name }}</span>
            <span class="group-status-state">thinking</span>
          </button>

          <div v-if="deliberatingPlayers.length === 0" key="empty-deliberating" class="group-status-empty">
            Everyone is ready.
          </div>
        </TransitionGroup>
      </section>

      <div aria-hidden="true" class="group-status-gap">
        <span>{{ votedCount }}/{{ totalPlayers }}</span>
        <v-icon icon="mdi-arrow-right-bold" size="18" />
      </div>

      <section class="group-status-zone group-status-zone-ready" data-test-id="group-zone-ready">
        <div class="group-status-zone-head">
          <span>Ready</span>
          <strong>{{ readyPlayers.length }}</strong>
        </div>

        <TransitionGroup class="group-status-roster" name="group-player" tag="div">
          <button
            v-for="player in readyPlayers"
            :key="player.userId"
            class="group-status-player group-status-player-ready"
            :class="{
              'is-you': player.userId === currentUserId,
              'is-leader': player.userId === leaderUserId,
              'is-connected': player.isConnected,
            }"
            :data-player-name="player.name"
            data-test-id="group-status-player-ready"
            type="button"
            @contextmenu.prevent="emit('open-player-menu', { userId: player.userId, name: player.name, x: $event.clientX, y: $event.clientY })"
          >
            <span class="group-status-avatar" :data-reaction-user-id="player.userId">
              <PlayerAvatar
                :avatar-crop="player.avatarCrop"
                :avatar-seed="player.name"
                :avatar-url="player.avatarUrl"
                :size="44"
              />
            </span>

            <span class="group-status-name">{{ player.name }}</span>
            <span class="group-status-state">{{ showVotes ? formatVote(player.vote) : 'ready' }}</span>
          </button>

          <div v-if="readyPlayers.length === 0" key="empty-ready" class="group-status-empty">
            Waiting for the first vote.
          </div>
        </TransitionGroup>
      </section>
    </div>
  </section>
</template>
