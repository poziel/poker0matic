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
          data-test-id="create-room-submit"
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
  import { ref as dbRef, onDisconnect, set } from 'firebase/database'
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import RoomSettingsForm, { type RoomFormSettings } from '@/components/RoomSettingsForm.vue'
  import { useAppStore } from '@/stores/app'
  import { useConfigStore } from '@/stores/config'
  import { buildSelectedAvatarCrop, buildSelectedAvatarUrl, resolveAvatarBackgroundColor } from '@/utils/avatarStyles'
  import { DEFAULT_REACTION_EMOJIS, sanitizeReactionEmojis } from '@/utils/reactions'
  import { buildInitialTimerForRoom, normalizeTimerDurationSeconds, normalizeTimerWarningValue } from '@/utils/roundTimers'

  const router = useRouter()
  const appStore = useAppStore()
  const configStore = useConfigStore()
  const db = configStore.getDb()

  const settings = ref<RoomFormSettings>({
    name: '',
    deck: 'fibonacci',
    customDeck: '',
    specialQuestion: true,
    specialCoffee: true,
    historyEnabled: true,
    allowVoteChangesAfterReveal: false,
    leaderModeEnabled: false,
    taskInformationEnabled: false,
    timerEnabled: false,
    timerMode: 'automatic',
    timerDurationSeconds: 300,
    timerAutoRevealEnabled: true,
    timerWarningEnabled: false,
    timerWarningType: 'seconds',
    timerWarningValue: 30,
    reactionsEnabled: false,
    reactionEmojis: [...DEFAULT_REACTION_EMOJIS],
  })

  function createRoom () {
    if (!settings.value.name.trim() || !db || !configStore.userId) return

    const {
      name,
      deck,
      customDeck,
      specialQuestion,
      specialCoffee,
      historyEnabled,
      allowVoteChangesAfterReveal,
      leaderModeEnabled,
      taskInformationEnabled,
      timerEnabled,
      timerMode,
      timerDurationSeconds,
      timerAutoRevealEnabled,
      timerWarningEnabled,
      timerWarningType,
      timerWarningValue,
      reactionsEnabled,
      reactionEmojis,
    } = settings.value
    const userName = configStore.userName || 'Guest'
    const userId = configStore.userId
    const newRoomId = Math.random().toString(36).slice(2, 10)

    const roomRef = dbRef(db, `rooms/${newRoomId}`)
    const joinedAt = Date.now()
    const creatorProfile = {
      name: userName,
      joinedAt,
      avatarUrl: buildSelectedAvatarUrl({
        avatarSource: configStore.avatarSource,
        customAvatarUrl: configStore.customAvatarUrl,
        gravatarEmail: configStore.gravatarEmail,
        avatarStyle: configStore.avatarStyle,
        avatarSeed: configStore.avatarSeed,
        avatarBg: resolveAvatarBackgroundColor(configStore.avatarBg, appStore.currentTheme),
        fallbackSeed: userName,
      }),
      avatarCrop: buildSelectedAvatarCrop(configStore.avatarSource, configStore.customAvatarCrop),
    }
    const normalizedTimerDurationSeconds = normalizeTimerDurationSeconds(timerDurationSeconds)
    const timerSettings = {
      timerEnabled,
      timerMode,
      timerDurationSeconds: normalizedTimerDurationSeconds,
      timerAutoRevealEnabled,
      timerWarningEnabled,
      timerWarningType,
      timerWarningValue: normalizeTimerWarningValue(timerWarningValue, timerWarningType),
    }
    set(roomRef, {
      name: name.trim(),
      createdAt: joinedAt,
      createdBy: userId,
      createdByUserId: userId,
      leaderUserId: leaderModeEnabled ? userId : null,
      currentTask: null,
      roundParticipants: {
        [userId]: creatorProfile,
      },
      roundEditLock: null,
      roundNumber: 1,
      roundTimer: taskInformationEnabled ? null : buildInitialTimerForRoom(timerSettings, 1, joinedAt),
      settings: {
        showVotes: false,
        v: 0,
        deck,
        customDeck: deck === 'custom' ? customDeck.trim() : null,
        specialQuestion,
        specialCoffee,
        historyEnabled,
        allowVoteChangesAfterReveal,
        leaderModeEnabled,
        taskInformationEnabled,
        reactionsEnabled,
        reactionEmojis: sanitizeReactionEmojis(reactionEmojis),
        ...timerSettings,
      },
      lastActivity: joinedAt,
    }).catch(console.error)

    const userRef = dbRef(db, `rooms/${newRoomId}/users/${userId}`)
    set(userRef, creatorProfile).catch(console.error)

    onDisconnect(userRef).remove()

    router.push(`/app/room/${newRoomId}`)
  }
</script>
