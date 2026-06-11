<template>
  <section class="settings-section-panel">
    <div class="settings-section-head">
      <h3>Theme</h3>
      <p>Choose the palette and how it follows light or dark mode.</p>
    </div>

    <div aria-label="Theme mode" class="theme-mode-toggle" role="group">
      <button
        v-for="option in themeModeOptions"
        :key="option.value"
        class="theme-mode-option"
        :class="{ active: model.themeModePreference === option.value }"
        :data-test-id="`profile-theme-mode-${option.value}`"
        type="button"
        @click="model.themeModePreference = option.value"
      >
        <v-icon :icon="option.icon" size="16" />
        <span>{{ option.label }}</span>
      </button>
    </div>

    <div class="theme-grid">
      <button
        v-for="theme in themeOptions"
        :key="theme.family"
        class="theme-card"
        :class="{ active: model.theme === theme.family }"
        :data-test-id="`profile-theme-${theme.family}`"
        type="button"
        @click="model.theme = theme.family"
      >
        <span
          class="theme-swatch"
          :class="{ 'theme-swatch-system': model.themeModePreference === 'system' }"
          :style="swatchStyle(theme)"
        >
          <span class="theme-dot" :style="dotStyle(theme)" />
        </span>

        <span class="theme-label">{{ theme.label }}</span>
        <v-icon v-if="model.theme === theme.family" class="theme-check" icon="mdi-check-circle" size="14" />
      </button>
    </div>
  </section>
</template>

<script lang="ts" setup>
  import type { SettingsDraft } from '@/components/settings/types'
  import { computed } from 'vue'
  import {
    THEME_FAMILIES,
    THEME_FAMILY_LOOKUP,
    type ThemeModePreference,
  } from '@/utils/themes'

  const model = defineModel<SettingsDraft>({ required: true })

  const themeModeOptions: Array<{ value: ThemeModePreference, label: string, icon: string }> = [
    { value: 'system', label: 'Follow browser theme', icon: 'mdi-theme-light-dark' },
    { value: 'dark', label: 'Dark theme', icon: 'mdi-weather-night' },
    { value: 'light', label: 'Light theme', icon: 'mdi-white-balance-sunny' },
  ]
  const themeOptions = computed(() => THEME_FAMILIES.map(family => THEME_FAMILY_LOOKUP[family]))

  function swatchStyle (theme: typeof themeOptions.value[number]) {
    if (model.value.themeModePreference === 'system') {
      return {
        '--theme-dark-bg': theme.dark?.preview.bg,
        '--theme-light-bg': theme.light?.preview.bg,
      }
    }

    return { background: theme[model.value.themeModePreference]?.preview.bg }
  }

  function dotStyle (theme: typeof themeOptions.value[number]) {
    if (model.value.themeModePreference === 'system') {
      return {
        background: `linear-gradient(135deg, ${theme.dark?.preview.accent} 0 50%, ${theme.light?.preview.accent} 50% 100%)`,
      }
    }

    return { background: theme[model.value.themeModePreference]?.preview.accent }
  }
</script>
