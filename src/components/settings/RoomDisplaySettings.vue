<template>
  <section class="settings-section-panel">
    <div class="settings-section-head">
      <h3>Room display</h3>
      <p>Choose how room results are presented when you are voting.</p>
    </div>

    <div class="settings-option-grid">
      <button
        class="settings-choice-card"
        :class="{ active: model.viewMode === 'table' }"
        type="button"
        @click="model.viewMode = 'table'"
      >
        <v-icon icon="mdi-table" size="22" />

        <span>
          <strong>Table view</strong>

          <small>Show participants around the poker table.</small>
        </span>
      </button>

      <button
        class="settings-choice-card"
        :class="{ active: model.viewMode === 'grid' }"
        type="button"
        @click="model.viewMode = 'grid'"
      >
        <v-icon icon="mdi-cards-playing" size="22" />

        <span>
          <strong>Grid view</strong>

          <small>Show participants in a compact results grid.</small>
        </span>
      </button>
    </div>
  </section>
</template>

<script lang="ts" setup>
  import type { SettingsDraft } from '@/components/settings/types'

  const model = defineModel<SettingsDraft>({ required: true })
</script>
