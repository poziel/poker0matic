<template>
  <v-menu content-class="p0-user-menu" location="bottom end" origin="top end">
    <template #activator="{ props }">
      <v-btn v-bind="props" class="user-menu-btn" variant="text">
        <PlayerAvatar
          :avatar-bg="configStore.avatarBg"
          :avatar-seed="configStore.avatarSeed || displayName"
          :avatar-source="configStore.avatarSource"
          :avatar-style="configStore.avatarStyle"
          :custom-avatar-crop="configStore.customAvatarCrop"
          :custom-avatar-url="configStore.customAvatarUrl"
          :size="32"
          square
        />

        <span class="user-menu-name">{{ displayName }}</span>
      </v-btn>
    </template>

    <v-list class="p0-menu-list" density="compact" min-width="200">
      <v-list-item class="p0-menu-item" prepend-icon="mdi-account-cog" title="Profile" @click="profileDialog = true" />

      <v-divider class="p0-menu-divider" />

      <v-list-item class="p0-menu-item" prepend-icon="mdi-cog" title="Configuration" @click="appStore.setConfigModalOpen(true)" />
      <v-list-item class="p0-menu-item" prepend-icon="mdi-information-outline" title="About" @click="aboutModalOpen = true" />
    </v-list>
  </v-menu>

  <UserSettingsModal v-model="profileDialog" />
  <AboutModal v-model="aboutModalOpen" />
</template>

<script lang="ts" setup>
  import { storeToRefs } from 'pinia'
  import { computed, ref } from 'vue'
  import AboutModal from '@/components/AboutModal.vue'
  import PlayerAvatar from '@/components/PlayerAvatar.vue'
  import UserSettingsModal from '@/components/settings/UserSettingsModal.vue'
  import { useAppStore } from '@/stores/app'
  import { useConfigStore } from '@/stores/config'

  const appStore = useAppStore()
  const configStore = useConfigStore()
  const { userName } = storeToRefs(configStore)

  const profileDialog = ref(false)
  const aboutModalOpen = ref(false)

  const displayName = computed(() => userName.value || 'Guest')
</script>
