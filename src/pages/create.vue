<template>
  <v-container class="setup-screen" fluid>
    <v-card class="setup-card page-card" flat>
      <div>
        <div class="kicker">New session</div>
        <h1 class="setup-title">Create a room</h1>
        <p class="setup-desc">Give your planning session a name and configure the deck.</p>
      </div>

      <v-form class="setup-form" @submit.prevent="createRoom">
        <RoomSettingsForm v-model="settings" autofocus />

        <v-btn
          class="p0-btn p0-btn-primary"
          :disabled="!settings.name.trim()"
          prepend-icon="mdi-plus"
          type="submit"
          variant="flat"
        >
          Create room
        </v-btn>
      </v-form>
    </v-card>
  </v-container>
</template>

<script lang="ts" setup>
  import type { RoomRecord, RoomUser } from '@/types/room'
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import RoomSettingsForm, { type RoomFormSettings } from '@/components/RoomSettingsForm.vue'
  import { useAppStore } from '@/stores/app'
  import { useConfigStore } from '@/stores/config'

  const router = useRouter()
  const appStore = useAppStore()
  const configStore = useConfigStore()

  const settings = ref<RoomFormSettings>({
    name: '',
    deck: 'fibonacci',
    customDeck: '',
    specialQuestion: true,
    specialCoffee: true,
    historyEnabled: true,
    leaderModeEnabled: false,
    taskInformationEnabled: false,
  })

  async function createRoom () {
    const backend = configStore.getBackend()
    if (!settings.value.name.trim() || !backend || !configStore.userId) return

    const { name, deck, customDeck, specialQuestion, specialCoffee, historyEnabled, leaderModeEnabled, taskInformationEnabled } = settings.value
    const userName = configStore.userName || 'Guest'
    const newRoomId = Math.random().toString(36).slice(2, 10)

    const room: RoomRecord = {
      name: name.trim(),
      createdAt: Date.now(),
      createdBy: configStore.userId,
      createdByUserId: configStore.userId,
      leaderUserId: leaderModeEnabled ? configStore.userId : null,
      currentTask: null,
      roundEditLock: null,
      roundNumber: 1,
      settings: {
        showVotes: false,
        v: 0,
        deck,
        customDeck: deck === 'custom' ? customDeck.trim() : null,
        specialQuestion,
        specialCoffee,
        historyEnabled,
        leaderModeEnabled,
        taskInformationEnabled,
      },
      lastActivity: Date.now(),
    }

    const initialUser: RoomUser = {
      name: userName,
      joinedAt: Date.now(),
    }

    try {
      await backend.createRoom(newRoomId, room, initialUser, configStore.userId)
      router.push(`/rooms/${newRoomId}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not create the room.'
      appStore.showToast(message, 'error')
    }
  }
</script>
