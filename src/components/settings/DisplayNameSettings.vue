<template>
  <section class="settings-section-panel">
    <div class="settings-section-head">
      <h3>Display name</h3>
      <p>This is how you appear in planning rooms.</p>
    </div>

    <v-form class="settings-form" @submit.prevent>
      <v-text-field
        v-model="model.userName"
        autofocus
        class="ui-field"
        :counter="MAX_NAME_LENGTH"
        data-test-id="profile-display-name-input"
        hide-details="auto"
        label="Your name"
        :maxlength="MAX_NAME_LENGTH"
        variant="outlined"
      />
    </v-form>
  </section>
</template>

<script lang="ts" setup>
  import type { SettingsDraft } from '@/components/settings/types'

  const MAX_NAME_LENGTH = 20
  const model = defineModel<SettingsDraft>({ required: true })
</script>
