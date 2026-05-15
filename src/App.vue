<template>
  <v-app class="p0-app">
    <v-app-bar v-if="!isPublicRoute" class="hdr" flat height="57">
      <v-btn
        class="brand"
        :ripple="false"
        to="/"
        variant="text"
      >
        <div class="brand-mark">
          <img alt="Poker0matic logo" src="/images/logo.png">
        </div>

        <div class="brand-name">poker<span>0</span>matic</div>
      </v-btn>

      <v-spacer />

      <div class="hdr-right">
        <router-link
          v-if="appStore.currentRoomId && (appStore.roomPresenceActive || appStore.roomHasActiveVote)"
          class="room-pill"
          :class="{ 'room-pill-away': !appStore.roomPresenceActive || !isInRoom }"
          :to="`/app/room/${appStore.currentRoomId}`"
        >
          <span class="dot" />
          <span class="room-name">{{ appStore.roomName }}</span>
          <span class="room-meta">{{ appStore.playerCount }} online</span>
        </router-link>

        <UserMenu />
      </div>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>

    <v-snackbar
      v-model="appStore.toastVisible"
      class="p0-snackbar"
      :color="appStore.toastType === 'success' ? 'success' : 'error'"
      location="bottom right"
      variant="flat"
    >
      <v-icon
        :icon="appStore.toastType === 'success' ? 'mdi-check' : 'mdi-close'"
        size="16"
      />
      {{ appStore.toastMessage }}
    </v-snackbar>

    <ConfigModal v-model="appStore.configModalOpen" />

    <!-- ── Global username setup (shown once on first visit) ───────────── -->
    <v-dialog v-model="nameSetupOpen" max-width="400" persistent>
      <v-card class="p0-modal" flat>
        <div class="p0-modal-head">
          <h2>What's your name?</h2>
          <p>This is how you'll appear in planning rooms. You can change it anytime from the user menu.</p>
        </div>

        <v-form @submit.prevent="submitSetupName">
          <div class="p0-modal-body">
            <v-text-field
              v-model="setupName"
              autofocus
              class="p0-field"
              :counter="20"
              hide-details="auto"
              label="Your name"
              maxlength="20"
              placeholder="e.g. Alex"
              variant="outlined"
            />
          </div>

          <div class="p0-modal-foot">
            <v-btn
              class="p0-btn p0-btn-primary"
              :disabled="!setupName.trim()"
              type="submit"
              variant="flat"
            >
              Continue
            </v-btn>
          </div>
        </v-form>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script lang="ts" setup>
  import { ref as dbRef, get } from 'firebase/database'
  import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import ConfigModal from '@/components/ConfigModal.vue'
  import UserMenu from '@/components/UserMenu.vue'
  import { useAppStore } from '@/stores/app'
  import { useConfigStore } from '@/stores/config'
  import { hasActiveOverlay, registerKeyboardShortcuts } from '@/utils/keyboardShortcuts'

  const route = useRoute()
  const router = useRouter()
  const appStore = useAppStore()
  const configStore = useConfigStore()

  const isInRoom = computed(() => route.path.startsWith('/app/room/'))
  const isPublicRoute = computed(() => route.meta.public === true)

  const nameSetupOpen = ref(false)
  const setupName = ref('')
  let unregisterShortcuts: (() => void) | null = null

  function syncNameSetupPrompt () {
    if (isPublicRoute.value) {
      nameSetupOpen.value = false
      return
    }

    if (!configStore.userName.trim()) {
      nameSetupOpen.value = true
    }
  }

  onMounted(async () => {
    configStore.initializeConfig()
    syncNameSetupPrompt()

    await restoreRoomPillFromActiveVote()

    unregisterShortcuts = registerKeyboardShortcuts([
      {
        id: 'app.open-config',
        group: 'app',
        description: 'Open Firebase configuration',
        keys: [
          { key: '.', ctrlKey: true },
          { key: '.', metaKey: true },
        ],
        allowInEditable: true,
        when: () => !nameSetupOpen.value && !hasActiveOverlay(),
        handler: () => {
          appStore.setConfigModalOpen(true)
        },
      },
      {
        id: 'app.create-room',
        group: 'app',
        description: 'Create a new room',
        keys: [
          { key: 'n', ctrlKey: true, altKey: true },
          { key: 'n', metaKey: true, altKey: true },
        ],
        allowInEditable: true,
        when: () => !nameSetupOpen.value && !hasActiveOverlay() && route.path !== '/app/create',
        handler: () => {
          router.push('/app/create')
        },
      },
    ])
  })

  watch(() => route.fullPath, () => {
    syncNameSetupPrompt()
  })

  onUnmounted(() => {
    unregisterShortcuts?.()
  })

  function submitSetupName () {
    const trimmed = setupName.value.trim().slice(0, 20)
    configStore.setUserName(trimmed || 'Guest')
    nameSetupOpen.value = false
  }

  async function restoreRoomPillFromActiveVote () {
    if (route.path.startsWith('/app/room/')) return
    if (!configStore.userId) return

    const db = configStore.getDb()
    if (!db) return

    for (const recentRoom of configStore.recentRooms) {
      try {
        const snapshot = await get(dbRef(db, `rooms/${recentRoom.id}`))
        if (!snapshot.exists()) continue

        const room = snapshot.val() as {
          name?: string
          users?: Record<string, unknown>
          roundParticipants?: Record<string, { vote?: unknown }>
        }

        const userVote = room.roundParticipants?.[configStore.userId]?.vote
        if (userVote == null) continue

        const roomName = room.name ?? recentRoom.name
        const connectedUsers = room.users ?? {}
        const isConnected = Object.hasOwn(connectedUsers, configStore.userId)

        configStore.setActiveRoom(recentRoom.id, roomName)
        appStore.setRoomInfo(
          recentRoom.id,
          roomName,
          Object.keys(connectedUsers).length,
          isConnected,
          true,
        )
        return
      } catch {
        // Ignore transient read errors and keep searching recents.
      }
    }
  }
</script>
