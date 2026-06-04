<template>
  <SettingsModalShell
    v-model="model"
    v-model:active-section="activeSection"
    description="Manage your personal Poker0matic profile."
    :sections="profileSections"
    title="Profile"
  >
    <component :is="activeComponent" v-model="settingsDraft" />

    <template #footer>
      <v-btn class="p0-btn p0-btn-ghost" variant="flat" @click="model = false">Cancel</v-btn>

      <v-btn class="p0-btn p0-btn-primary" :disabled="!settingsDraft.userName.trim()" variant="flat" @click="saveSettings">
        Save profile
      </v-btn>
    </template>
  </SettingsModalShell>
</template>

<script lang="ts" setup>
  import type { SettingsDraft } from '@/components/settings/types'
  import { computed, ref, watch } from 'vue'
  import AvatarSettings from '@/components/settings/AvatarSettings.vue'
  import DisplayNameSettings from '@/components/settings/DisplayNameSettings.vue'
  import RoomDisplaySettings from '@/components/settings/RoomDisplaySettings.vue'
  import SettingsModalShell from '@/components/settings/SettingsModalShell.vue'
  import ThemeSettings from '@/components/settings/ThemeSettings.vue'
  import { useAppStore } from '@/stores/app'
  import { useConfigStore } from '@/stores/config'

  type SettingsSectionId = 'theme' | 'avatar' | 'display-name' | 'room-display'

  const model = defineModel<boolean>({ required: true })
  const appStore = useAppStore()
  const configStore = useConfigStore()

  const profileSections = [
    { id: 'theme', label: 'Theme', icon: 'mdi-palette', component: ThemeSettings },
    { id: 'avatar', label: 'Avatar', icon: 'mdi-account-circle', component: AvatarSettings },
    { id: 'display-name', label: 'Display name', icon: 'mdi-pencil', component: DisplayNameSettings },
    { id: 'room-display', label: 'Room display', icon: 'mdi-view-dashboard-outline', component: RoomDisplaySettings },
  ] as const

  const activeSection = ref<SettingsSectionId>('theme')
  const settingsDraft = ref<SettingsDraft>(createSettingsDraft())
  const activeComponent = computed(() => {
    return profileSections.find(section => section.id === activeSection.value)?.component ?? ThemeSettings
  })

  watch(model, open => {
    if (open) {
      settingsDraft.value = createSettingsDraft()
    }
  })

  function createSettingsDraft (): SettingsDraft {
    return {
      theme: appStore.currentTheme,
      avatarStyle: configStore.avatarStyle,
      avatarSeed: configStore.avatarSeed,
      avatarBg: configStore.avatarBg,
      userName: configStore.userName,
      viewMode: configStore.viewMode,
    }
  }

  function saveSettings () {
    const trimmedName = settingsDraft.value.userName.trim().slice(0, 20)
    if (!trimmedName) return

    appStore.setTheme(settingsDraft.value.theme)
    configStore.setAvatarStyle(settingsDraft.value.avatarStyle)
    configStore.setAvatarSeed(settingsDraft.value.avatarSeed)
    configStore.setAvatarBg(settingsDraft.value.avatarBg)
    configStore.setUserName(trimmedName)
    configStore.setViewMode(settingsDraft.value.viewMode)
    model.value = false
  }
</script>
