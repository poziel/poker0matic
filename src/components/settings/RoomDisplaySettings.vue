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
        <v-icon icon="mdi-view-module-outline" size="22" />

        <span>
          <strong>Card wall</strong>

          <small>Show participants as a flexible wall of cards.</small>
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

      <button
        class="settings-choice-card"
        :class="{ active: model.viewMode === 'simple' }"
        type="button"
        @click="model.viewMode = 'simple'"
      >
        <v-icon icon="mdi-view-dashboard-outline" size="22" />

        <span>
          <strong>Simple room</strong>

          <small>Keep voting, status, and results visible on the page.</small>
        </span>
      </button>

      <button
        class="settings-choice-card"
        :class="{ active: model.viewMode === 'console' }"
        type="button"
        @click="model.viewMode = 'console'"
      >
        <v-icon icon="mdi-console" size="22" />

        <span>
          <strong>Console view</strong>

          <small>Track the room as a readable terminal-style activity feed.</small>
        </span>
      </button>

      <button
        class="settings-choice-card"
        :class="{ active: model.viewMode === 'group-status' }"
        type="button"
        @click="model.viewMode = 'group-status'"
      >
        <v-icon icon="mdi-account-switch-outline" size="22" />

        <span>
          <strong>Group status</strong>

          <small>Move players between deliberating and ready zones as votes arrive.</small>
        </span>
      </button>
    </div>
  </section>
</template>

<script lang="ts" setup>
  import type { SettingsDraft } from '@/components/settings/types'

  const model = defineModel<SettingsDraft>({ required: true })
</script>
