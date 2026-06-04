<template>
  <main class="dock-window">
    <section class="dock-window-panel">
      <div class="dock-window-head">
        <div>
          <p class="dock-window-kicker">Voting dock</p>
          <h1>{{ title }}</h1>
        </div>

        <v-btn
          aria-label="Close voting dock"
          class="icon-btn"
          density="compact"
          icon
          title="Close voting dock"
          variant="text"
          @click="closeWindow"
        >
          <v-icon icon="mdi-close" size="16" />
        </v-btn>
      </div>

      <template v-if="!configStore.configFound">
        <div class="dock-window-empty">
          <v-icon icon="mdi-database-off-outline" size="28" />
          <p>Firebase configuration is missing in this window.</p>

          <v-btn class="p0-btn p0-btn-primary" to="/app/config" variant="flat">
            Open configuration
          </v-btn>
        </div>
      </template>

      <template v-else-if="!context.roomId">
        <div class="dock-window-empty">
          <v-icon icon="mdi-cards-outline" size="28" />
          <p>No active room is available for voting.</p>
        </div>
      </template>

      <template v-else-if="roomMissing">
        <div class="dock-window-empty">
          <v-icon icon="mdi-alert-circle-outline" size="28" />
          <p>This room could not be found.</p>
        </div>
      </template>

      <template v-else-if="currentRoom">
        <VoteDock
          :can-commit-vote="canCommitFinalVote"
          :can-vote="canVoteInCurrentRound"
          :collapsed="false"
          :committed-vote="committedVote"
          :disabled-hint="voteActionHint"
          :display-vote-counts="displayVoteCounts"
          external-window
          :history-enabled="historyEnabled"
          :selected-vote="selectedVote"
          :show-votes="showVotes"
          :stats="stats"
          :user-name="userName || 'Guest'"
          :vote-options="voteOptions"
          @cast-vote="castVote"
          @commit-vote="commitVote"
        />
      </template>

      <template v-else>
        <div class="dock-window-empty">
          <v-icon icon="mdi-loading" size="28" />
          <p>Connecting to the active room.</p>
        </div>
      </template>
    </section>
  </main>
</template>

<script setup lang="ts">
  import { computed, onMounted, onUnmounted, ref } from 'vue'
  import { useRoute } from 'vue-router'
  import VoteDock from '@/components/VoteDock.vue'
  import { useRoomVotingDock } from '@/composables/useRoomVotingDock'
  import { useConfigStore } from '@/stores/config'
  import {
    clearExternalDockHeartbeat,
    EXTERNAL_DOCK_COMMAND_KEY,
    EXTERNAL_DOCK_CONTEXT_KEY,
    type ExternalDockRoomContext,
    readExternalDockContext,
    writeExternalDockHeartbeat,
  } from '@/utils/externalDock'

  const configStore = useConfigStore()
  const route = useRoute()
  const context = ref<ExternalDockRoomContext>(resolveInitialContext())
  const {
    canCommitFinalVote,
    canVoteInCurrentRound,
    castVote,
    commitVote,
    committedVote,
    currentRoom,
    displayVoteCounts,
    historyEnabled,
    roomMissing,
    selectedVote,
    showVotes,
    stats,
    stop,
    subscribeToRoom,
    userName,
    voteActionHint,
    voteOptions,
  } = useRoomVotingDock()

  let heartbeatTimer: ReturnType<typeof setInterval> | null = null

  const title = computed(() => {
    if (currentRoom.value?.name) return currentRoom.value.name
    if (context.value.roomName) return context.value.roomName
    if (context.value.roomId) return 'Active room'
    return 'No active room'
  })

  onMounted(() => {
    configStore.initializeConfig()
    writeHeartbeat()
    heartbeatTimer = setInterval(writeHeartbeat, 1000)
    window.addEventListener('storage', onStorage)
    window.addEventListener('beforeunload', clearExternalDockHeartbeat)
    subscribeToRoom(context.value.roomId)
  })

  onUnmounted(() => {
    stop()
    window.removeEventListener('storage', onStorage)
    window.removeEventListener('beforeunload', clearExternalDockHeartbeat)
    if (heartbeatTimer !== null) clearInterval(heartbeatTimer)
    clearExternalDockHeartbeat()
  })

  function writeHeartbeat () {
    writeExternalDockHeartbeat()
  }

  function onStorage (event: StorageEvent) {
    if (event.key === EXTERNAL_DOCK_CONTEXT_KEY) {
      context.value = readExternalDockContext()
      subscribeToRoom(context.value.roomId)
      return
    }

    if (event.key === EXTERNAL_DOCK_COMMAND_KEY) {
      closeWindow()
    }
  }

  function closeWindow () {
    window.close()
  }

  function resolveInitialContext (): ExternalDockRoomContext {
    const routeRoomId = typeof route.params.roomId === 'string' && route.params.roomId.trim()
      ? route.params.roomId.trim()
      : null
    const storedContext = readExternalDockContext()

    if (!routeRoomId) {
      return storedContext
    }

    if (storedContext.roomId === routeRoomId) {
      return storedContext
    }

    return {
      roomId: routeRoomId,
      roomName: null,
      updatedAt: Date.now(),
    }
  }
</script>
