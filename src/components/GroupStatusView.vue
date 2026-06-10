<script setup lang="ts">
  import type { VoteValue } from '@/types/room'
  import type { AvatarCrop } from '@/utils/avatarStyles'
  import { computed, onBeforeUpdate, onUpdated, ref } from 'vue'
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
  const viewElement = ref<HTMLElement | null>(null)
  const previousPlayerRects = new Map<string, DOMRect>()

  const formatVote = (vote: VoteValue | null | undefined) => vote == null ? '-' : String(vote)

  function getPlayerElements () {
    return Array.from(viewElement.value?.querySelectorAll<HTMLElement>('[data-group-status-user-id]') ?? [])
  }

  onBeforeUpdate(() => {
    previousPlayerRects.clear()
    for (const element of getPlayerElements()) {
      previousPlayerRects.set(element.dataset.groupStatusUserId ?? '', element.getBoundingClientRect())
    }
  })

  onUpdated(() => {
    for (const element of getPlayerElements()) {
      const previousRect = previousPlayerRects.get(element.dataset.groupStatusUserId ?? '')
      if (!previousRect) continue

      const nextRect = element.getBoundingClientRect()
      const deltaX = previousRect.left - nextRect.left
      const deltaY = previousRect.top - nextRect.top

      if (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1) continue

      element.style.transition = 'none'
      element.style.transform = `translate(${deltaX}px, ${deltaY}px)`
      element.getBoundingClientRect()

      requestAnimationFrame(() => {
        element.style.transition = ''
        element.style.transform = ''
      })
    }
  })
</script>

<template>
  <section ref="viewElement" class="group-status-view" data-test-id="room-group-status-view">
    <div aria-hidden="true" class="group-status-meter">
      <span class="group-status-meter-fill" :style="{ width: `${readyPercent}%` }" />
    </div>

    <div class="group-status-board">
      <section class="group-status-zone group-status-zone-deliberating" data-test-id="group-zone-deliberating">
        <div class="group-status-zone-head">
          <span>Deliberating</span>
          <strong>{{ deliberatingPlayers.length }}</strong>
        </div>

        <div class="group-status-roster">
          <button
            v-for="player in deliberatingPlayers"
            :key="player.userId"
            class="group-status-player"
            :class="{
              'is-you': player.userId === currentUserId,
              'is-leader': player.userId === leaderUserId,
              'is-connected': player.isConnected,
            }"
            :data-group-status-user-id="player.userId"
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
        </div>
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

        <div class="group-status-roster">
          <button
            v-for="player in readyPlayers"
            :key="player.userId"
            class="group-status-player group-status-player-ready"
            :class="{
              'is-you': player.userId === currentUserId,
              'is-leader': player.userId === leaderUserId,
              'is-connected': player.isConnected,
            }"
            :data-group-status-user-id="player.userId"
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
        </div>
      </section>
    </div>
  </section>
</template>
