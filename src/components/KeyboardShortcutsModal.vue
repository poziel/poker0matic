<script setup lang="ts">
  import { APP_SHORTCUT_HELP, ROOM_SHORTCUT_HELP } from '@/utils/keyboardShortcuts'

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
    <v-card class="ui-modal" flat>
      <div class="ui-modal-head">
        <h2>Keyboard shortcuts</h2>
        <p>Quick actions for navigating Refinimo and voting in rooms.</p>
      </div>

      <div class="ui-modal-body">
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

      <div class="ui-modal-foot">
        <v-btn
          class="ui-btn ui-btn-primary"
          variant="flat"
          @click="$emit('update:modelValue', false)"
        >
          Close
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>
