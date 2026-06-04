<script setup lang="ts">
  import { storeToRefs } from 'pinia'
  import { ref, watch } from 'vue'
  import SettingsModalShell from '@/components/settings/SettingsModalShell.vue'
  import { useAppStore } from '@/stores/app'
  import { type FirebaseConfig, useConfigStore } from '@/stores/config'
  import { copyText } from '@/utils/clipboard'

  const props = defineProps<{
    modelValue: boolean
  }>()

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
  }>()

  const appStore = useAppStore()
  const configStore = useConfigStore()
  const { firebaseConfig } = storeToRefs(configStore)
  const activeSection = ref('firebase')
  const configSections = [
    { id: 'firebase', label: 'Firebase', icon: 'mdi-firebase' },
  ] as const

  const config = ref<FirebaseConfig>({
    apiKey: '',
    authDomain: '',
    databaseUrl: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
  })

  // Sync form fields whenever the dialog opens
  watch(() => props.modelValue, open => {
    if (open) {
      configStore.initializeConfig()
      if (firebaseConfig.value) {
        Object.assign(config.value, firebaseConfig.value)
      }
    }
  }, { immediate: true })

  function saveConfig () {
    const configChanged = JSON.stringify(config.value) !== JSON.stringify(firebaseConfig.value)
    configStore.saveFirebaseConfig({ ...config.value })
    appStore.setRoomInfo(null, '', 0)
    appStore.showToast('Firebase config saved.', 'success')
    emit('update:modelValue', false)

    // Validate the new config in the background so the lobby (and any other
    // page that watches configValidationStatus) can update without re-checking.
    if (configChanged) {
      validateInBackground(config.value)
    }
  }

  async function validateInBackground (cfg: FirebaseConfig) {
    const baseUrl = cfg.databaseUrl.replace(/\/$/, '')
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 5000)
    try {
      const res = await fetch(`${baseUrl}/.json?shallow=true&print=silent`, { signal: controller.signal })
      clearTimeout(timer)
      configStore.setConfigValidationStatus(
        (res.ok || res.status === 401 || res.status === 403) ? 'valid' : 'unreachable',
      )
    } catch {
      clearTimeout(timer)
      configStore.setConfigValidationStatus('unreachable')
    }
  }

  async function shareConfig () {
    const encoded = btoa(JSON.stringify(config.value))
    const url = `${window.location.origin}${import.meta.env.BASE_URL}?config=${encodeURIComponent(encoded)}`
    const ok = await copyText(url)

    appStore.showToast(
      ok ? 'Config link copied.' : 'Copy failed. Your browser blocked clipboard access.',
      ok ? 'success' : 'error',
    )
  }
</script>

<template>
  <SettingsModalShell
    :active-section="activeSection"
    description="Manage shared app configuration for Poker0matic."
    :model-value="modelValue"
    :sections="configSections"
    title="Configuration"
    @update:active-section="activeSection = $event"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <section class="settings-section-panel">
      <div class="settings-section-head">
        <h3>Firebase</h3>
        <p>Connect the app to your own Firebase Realtime Database project.</p>
      </div>

      <div class="config-fields">
        <v-text-field
          v-model="config.apiKey"
          autocomplete="off"
          class="p0-field"
          hide-details="auto"
          label="apiKey"
          type="password"
          variant="outlined"
        />

        <v-text-field
          v-model="config.authDomain"
          class="p0-field"
          hide-details="auto"
          label="authDomain"
          variant="outlined"
        />

        <v-text-field
          v-model="config.databaseUrl"
          class="p0-field"
          hide-details="auto"
          label="databaseUrl"
          variant="outlined"
        />

        <v-text-field
          v-model="config.projectId"
          class="p0-field"
          hide-details="auto"
          label="projectId"
          variant="outlined"
        />

        <v-text-field
          v-model="config.storageBucket"
          class="p0-field"
          hide-details="auto"
          label="storageBucket"
          variant="outlined"
        />

        <v-text-field
          v-model="config.messagingSenderId"
          class="p0-field"
          hide-details="auto"
          label="messagingSenderId"
          variant="outlined"
        />

        <v-text-field
          v-model="config.appId"
          class="p0-field"
          hide-details="auto"
          label="appId"
          variant="outlined"
        />
      </div>
    </section>

    <template #footer>
      <v-btn
        class="p0-btn p0-btn-ghost"
        prepend-icon="mdi-share-variant"
        variant="flat"
        @click="shareConfig"
      >
        Share config
      </v-btn>

      <v-btn
        class="p0-btn p0-btn-primary"
        prepend-icon="mdi-content-save"
        variant="flat"
        @click="saveConfig"
      >
        Save config
      </v-btn>
    </template>
  </SettingsModalShell>
</template>
