<template>
  <v-container class="page-container" fluid>
    <v-card class="page-card" flat>
      <div class="page-card-head">
        <h2>Backend Config</h2>
      </div>

      <div class="page-card-body">
        <v-alert
          v-if="showError"
          class="cfg-alert cfg-alert-error"
          type="error"
          variant="tonal"
        >
          No backend config found. Enter your project credentials below.
        </v-alert>

        <v-alert
          class="cfg-alert cfg-alert-info"
          type="info"
          variant="tonal"
        >
          Config can also be loaded from a shared URL. Paste it in your address bar.
        </v-alert>

        <v-form @submit.prevent="saveConfig">
          <div class="config-fields">
            <v-select
              class="p0-field"
              hide-details="auto"
              item-title="label"
              item-value="id"
              :items="BACKEND_PROVIDER_DEFINITIONS"
              label="Backend provider"
              :model-value="config.provider"
              variant="outlined"
              @update:model-value="changeProvider"
            />

            <v-alert class="cfg-alert cfg-alert-info" type="info" variant="tonal">
              {{ currentProviderDefinition.shortDescription }}
            </v-alert>

            <v-text-field
              v-for="field in currentProviderDefinition.fields"
              :key="field.key"
              class="p0-field"
              hide-details="auto"
              :hint="field.hint"
              :label="field.label"
              :model-value="getFieldValue(field.key)"
              :persistent-hint="!!field.hint"
              :type="field.type === 'password' ? 'password' : 'text'"
              variant="outlined"
              @update:model-value="setFieldValue(field.key, String($event ?? ''))"
            />
          </div>

          <div class="page-card-foot config-actions">
            <v-btn
              class="p0-btn p0-btn-primary"
              prepend-icon="mdi-content-save"
              type="submit"
              variant="flat"
            >
              Save config
            </v-btn>

            <v-btn
              class="p0-btn p0-btn-ghost"
              prepend-icon="mdi-share-variant"
              variant="flat"
              @click="shareConfig"
            >
              Share config
            </v-btn>
          </div>
        </v-form>
      </div>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
  import type { BackendConfig, BackendProvider } from '@/backend/types'
  import { storeToRefs } from 'pinia'
  import { computed, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import {
    BACKEND_PROVIDER_DEFINITIONS,
    cloneBackendConfig,
    createEmptyBackendConfig,
    getBackendProviderDefinition,
  } from '@/backend/config'
  import { useAppStore } from '@/stores/app'
  import { useConfigStore } from '@/stores/config'
  import { copyText } from '@/utils/clipboard'

  defineProps<{
    showError?: boolean
  }>()

  const router = useRouter()
  const appStore = useAppStore()
  const configStore = useConfigStore()
  const { backendConfig } = storeToRefs(configStore)

  const config = ref<BackendConfig>(createEmptyBackendConfig())
  const currentProviderDefinition = computed(() => getBackendProviderDefinition(config.value.provider))

  configStore.initializeConfig()
  if (backendConfig.value) {
    config.value = cloneBackendConfig(backendConfig.value)
  }

  function changeProvider (provider: BackendProvider) {
    if (provider === config.value.provider) return
    config.value = createEmptyBackendConfig(provider)
  }

  function getFieldValue (key: string): string {
    return String((config.value.settings as Record<string, string>)[key] ?? '')
  }

  function setFieldValue (key: string, value: string) {
    ;(config.value.settings as Record<string, string>)[key] = value
  }

  function saveConfig () {
    configStore.saveBackendConfig(cloneBackendConfig(config.value))
    appStore.setRoomInfo(null, '', 0)
    router.push('/')
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
