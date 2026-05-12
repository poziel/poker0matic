<script setup lang="ts">
  import { APP_SHORTCUT_HELP, ROOM_SHORTCUT_HELP } from '@/utils/keyboardShortcuts'
  import { appVersion } from '@/utils/version'

  defineProps<{
    modelValue: boolean
  }>()

  defineEmits<{
    'update:modelValue': [value: boolean]
  }>()
</script>

<template>
  <v-dialog
    max-width="440"
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card class="p0-modal" flat>
      <div class="p0-modal-head">
        <h2>About</h2>
        <p>poker<strong>0</strong>matic — real-time collaborative planning poker.</p>
      </div>

      <div class="p0-modal-body">
        <p class="about-line about-version">Version v{{ appVersion }}</p>

        <div class="about-section">
          <h3 class="about-section-title">Keyboard shortcuts</h3>

          <p class="about-line">
            Shortcuts pause automatically while typing in inputs or when a modal or overlay has focus.
          </p>

          <div class="about-shortcuts-block">
            <p class="about-section-label">Global</p>

            <ul class="about-shortcut-list">
              <li v-for="shortcut in APP_SHORTCUT_HELP" :key="shortcut.keys">
                <span class="about-shortcut-keys">{{ shortcut.keys }}</span>
                <span class="about-shortcut-text">{{ shortcut.description }}</span>
              </li>
            </ul>
          </div>

          <div class="about-shortcuts-block">
            <p class="about-section-label">Inside a room</p>

            <ul class="about-shortcut-list">
              <li v-for="shortcut in ROOM_SHORTCUT_HELP" :key="shortcut.keys">
                <span class="about-shortcut-keys">{{ shortcut.keys }}</span>

                <span class="about-shortcut-copy">
                  <span class="about-shortcut-text">{{ shortcut.description }}</span>
                  <span v-if="shortcut.note" class="about-shortcut-note">{{ shortcut.note }}</span>
                </span>
              </li>
            </ul>
          </div>
        </div>

        <p class="about-line">Thanks to the services and projects that help power poker0matic.</p>

        <ul class="about-credit-list">
          <li>
            <a href="https://www.dicebear.com/" rel="noopener noreferrer" target="_blank">DiceBear</a>
            for the avatar API and generated player identities.
          </li>

          <li>
            <a href="https://docs.magnific.com/api-reference/icon-generation/overview" rel="noopener noreferrer" target="_blank">Magnific</a>
            for the icon generation workflow.
          </li>

          <li>
            <a href="https://vuetifyjs.com/" rel="noopener noreferrer" target="_blank">Vuetify</a>
            and

            <a href="https://pictogrammers.com/library/mdi/" rel="noopener noreferrer" target="_blank">Material Design Icons</a>
            for the interface foundation.
          </li>

          <li>
            <a href="https://firebase.google.com/products/realtime-database" rel="noopener noreferrer" target="_blank">Firebase Realtime Database</a>
            for the live room synchronization layer.
          </li>
        </ul>
      </div>

      <div class="p0-modal-foot">
        <v-btn
          class="p0-btn p0-btn-primary"
          variant="flat"
          @click="$emit('update:modelValue', false)"
        >
          Close
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>
