<script setup lang="ts">
  import type { BackendConfig, BackendProvider } from '@/backend/types'
  import { storeToRefs } from 'pinia'
  import { computed, ref, watch } from 'vue'
  import {
    BACKEND_PROVIDER_DEFINITIONS,
    cloneBackendConfig,
    createEmptyBackendConfig,
    getBackendProviderDefinition,
  } from '@/backend/config'
  import { useAppStore } from '@/stores/app'
  import { useConfigStore } from '@/stores/config'
  import { copyText } from '@/utils/clipboard'

  const props = defineProps<{
    modelValue: boolean
  }>()

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
  }>()

  const appStore = useAppStore()
  const configStore = useConfigStore()
  const { backendConfig } = storeToRefs(configStore)

  const config = ref<BackendConfig>(createEmptyBackendConfig())
  const currentProviderDefinition = computed(() => getBackendProviderDefinition(config.value.provider))

  watch(() => props.modelValue, open => {
    if (!open) return
    configStore.initializeConfig()
    config.value = backendConfig.value ? cloneBackendConfig(backendConfig.value) : createEmptyBackendConfig()
  }, { immediate: true })

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

  async function saveConfig () {
    const configChanged = JSON.stringify(config.value) !== JSON.stringify(backendConfig.value)
    configStore.saveBackendConfig(cloneBackendConfig(config.value))
    appStore.setRoomInfo(null, '', 0)
    appStore.showToast(`${currentProviderDefinition.value.label} config saved.`, 'success')
    emit('update:modelValue', false)

    if (configChanged) {
      await validateInBackground()
    }
  }

  async function validateInBackground () {
    const backend = configStore.getBackend()
    if (!backend) return
    const status = await backend.validateConfig(configStore.backendConfig!)
    configStore.setConfigValidationStatus(status)
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
  <v-dialog
    max-width="560"
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card class="p0-modal" flat>
      <div class="p0-modal-head">
        <h2>Backend Config</h2>
        <p>Select your backend provider and enter the connection details required for that platform.</p>
      </div>

      <v-form @submit.prevent="saveConfig">
        <div class="p0-modal-body">
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
        </div>

        <div class="p0-modal-foot">
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
            type="submit"
            variant="flat"
          >
            Save config
          </v-btn>
        </div>
      </v-form>
    </v-card>
  </v-dialog>
</template>
