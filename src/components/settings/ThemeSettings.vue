<template>
  <section class="settings-section-panel">
    <div class="settings-section-head">
      <h3>Theme</h3>
      <p>Choose the colour scheme for your interface.</p>
    </div>

    <div class="theme-section-list">
      <section class="theme-section">
        <div class="theme-section-head">
          <h4>Dark themes</h4>
          <p>Low-light palettes for focused voting sessions.</p>
        </div>

        <div class="theme-grid">
          <button
            v-for="theme in THEMES_BY_MODE.dark"
            :key="theme.id"
            class="theme-card"
            :class="{ active: model.theme === theme.id }"
            :data-test-id="`profile-theme-${theme.id}`"
            type="button"
            @click="model.theme = theme.id"
          >
            <span class="theme-swatch" :style="{ background: theme.preview.bg }">
              <span class="theme-dot" :style="{ background: theme.preview.accent }" />
            </span>

            <span class="theme-label">{{ theme.label }}</span>
            <v-icon v-if="model.theme === theme.id" class="theme-check" icon="mdi-check-circle" size="14" />
          </button>
        </div>
      </section>

      <section class="theme-section">
        <div class="theme-section-head">
          <h4>Light themes</h4>
          <p>Brighter palettes for daylight and shared screens.</p>
        </div>

        <div class="theme-grid">
          <button
            v-for="theme in THEMES_BY_MODE.light"
            :key="theme.id"
            class="theme-card"
            :class="{ active: model.theme === theme.id }"
            :data-test-id="`profile-theme-${theme.id}`"
            type="button"
            @click="model.theme = theme.id"
          >
            <span class="theme-swatch" :style="{ background: theme.preview.bg }">
              <span class="theme-dot" :style="{ background: theme.preview.accent }" />
            </span>

            <span class="theme-label">{{ theme.label }}</span>
            <v-icon v-if="model.theme === theme.id" class="theme-check" icon="mdi-check-circle" size="14" />
          </button>
        </div>
      </section>
    </div>
  </section>
</template>

<script lang="ts" setup>
  import type { SettingsDraft } from '@/components/settings/types'
  import { THEMES_BY_MODE } from '@/utils/themes'

  const model = defineModel<SettingsDraft>({ required: true })
</script>
