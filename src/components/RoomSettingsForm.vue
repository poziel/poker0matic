<script setup lang="ts">
  import { computed } from 'vue'
  import { MAX_REACTION_EMOJIS } from '@/utils/reactions'

  export type DeckPreset = 'fibonacci' | 'linear' | 'tshirt' | 'custom'

  type DeckPresetOption = {
    id: DeckPreset
    label: string
    preview: string
    count?: number
  }

  export interface RoomFormSettings {
    name: string
    deck: DeckPreset
    customDeck: string
    specialQuestion: boolean
    specialCoffee: boolean
    historyEnabled: boolean
    leaderModeEnabled: boolean
    taskInformationEnabled: boolean
    timerEnabled: boolean
    timerMode: 'automatic' | 'manual'
    timerDurationSeconds: number
    timerAutoRevealEnabled: boolean
    timerWarningEnabled: boolean
    timerWarningType: 'seconds' | 'percentage'
    timerWarningValue: number
    reactionsEnabled: boolean
    reactionEmojis: string[]
  }

  const DECK_PRESETS: DeckPresetOption[] = [
    { id: 'fibonacci', label: 'Fibonacci', preview: '0 · 1 · 2 · 3 · 5 · 8 · 13 · 21 · 34 · 55', count: 10 },
    { id: 'linear', label: 'Linear', preview: '1 · 2 · 3 · 4 · 5 · 6 · 7 · 8 · 9 · 10 · 12 · 15', count: 12 },
    { id: 'tshirt', label: 'T-shirt', preview: 'XS · S · M · L · XL · XXL', count: 6 },
    { id: 'custom', label: 'Custom', preview: 'Define your own sequence' },
  ]

  const props = defineProps<{
    modelValue: RoomFormSettings
    /** Auto-focus the room name field on mount (e.g. on the create page). */
    autofocus?: boolean
  }>()

  const emit = defineEmits<{
    'update:modelValue': [settings: RoomFormSettings]
  }>()

  const reactionEmojiSlots = computed(() =>
    Array.from({ length: MAX_REACTION_EMOJIS }, (_, index) => props.modelValue.reactionEmojis[index] ?? ''),
  )

  function patch (changes: Partial<RoomFormSettings>) {
    emit('update:modelValue', { ...props.modelValue, ...changes })
  }

  function patchTimerDuration (value: number | string) {
    const duration = typeof value === 'number' ? value : Number(value)
    patch({ timerDurationSeconds: duration })
  }

  function patchTimerWarningValue (value: number | string) {
    const warningValue = typeof value === 'number' ? value : Number(value)
    patch({ timerWarningValue: warningValue })
  }

  function patchReactionEmoji (index: number, value: string) {
    const reactionEmojis = [...props.modelValue.reactionEmojis]
    reactionEmojis[index] = value
    patch({ reactionEmojis })
  }
</script>

<template>
  <div class="room-settings-form">
    <!-- Room name -->
    <v-text-field
      :autofocus="autofocus"
      class="p0-field"
      hide-details="auto"
      label="Room name"
      maxlength="60"
      :model-value="modelValue.name"
      placeholder="e.g. Sprint 42 planning"
      required
      variant="outlined"
      @update:model-value="patch({ name: $event })"
    />

    <!-- Card deck -->
    <div class="room-settings-section">
      <span class="settings-label">Card deck</span>

      <div class="deck-picker">
        <button
          v-for="preset in DECK_PRESETS"
          :key="preset.id"
          class="deck-option"
          :class="{ active: modelValue.deck === preset.id }"
          type="button"
          @click="patch({ deck: preset.id })"
        >
          <div class="deck-option-top">
            <span class="deck-option-label">{{ preset.label }}</span>
            <span v-if="preset.count" class="deck-option-count">{{ preset.count }}</span>
            <v-icon v-else icon="mdi-pencil" size="12" style="color: var(--text-4)" />
          </div>

          <span class="deck-option-preview">{{ preset.preview }}</span>
        </button>
      </div>

      <v-text-field
        v-if="modelValue.deck === 'custom'"
        class="p0-field"
        hint="Comma-separated values — e.g. 1, 2, 3, 5, 8, 13"
        label="Custom values"
        :model-value="modelValue.customDeck"
        persistent-hint
        variant="outlined"
        @update:model-value="patch({ customDeck: $event })"
      />
    </div>

    <!-- Special cards -->
    <div class="room-settings-section">
      <span class="settings-label">Special cards</span>

      <div class="toggles-row">
        <label class="toggle-item">
          <div class="toggle-info">
            <span class="toggle-card">?</span>
            <span class="toggle-name">Unknown</span>
          </div>

          <input
            :checked="modelValue.specialQuestion"
            class="p0-toggle"
            type="checkbox"
            @change="patch({ specialQuestion: ($event.target as HTMLInputElement).checked })"
          >
        </label>

        <label class="toggle-item">
          <div class="toggle-info">
            <span class="toggle-card">☕</span>
            <span class="toggle-name">Break</span>
          </div>

          <input
            :checked="modelValue.specialCoffee"
            class="p0-toggle"
            type="checkbox"
            @change="patch({ specialCoffee: ($event.target as HTMLInputElement).checked })"
          >
        </label>
      </div>
    </div>

    <!-- Round history -->
    <div class="room-settings-section">
      <span class="settings-label">Round history</span>

      <label class="toggle-item">
        <div class="toggle-info">
          <v-icon icon="mdi-history" size="15" style="color: var(--text-2)" />
          <span class="toggle-name">Save completed rounds</span>
        </div>

        <input
          :checked="modelValue.historyEnabled"
          class="p0-toggle"
          type="checkbox"
          @change="patch({ historyEnabled: ($event.target as HTMLInputElement).checked })"
        >
      </label>
    </div>

    <div class="room-settings-section">
      <span class="settings-label">Round context</span>

      <label class="toggle-item">
        <div class="toggle-info">
          <v-icon icon="mdi-text-box-search-outline" size="15" style="color: var(--text-2)" />
          <span class="toggle-name">Require task information for rounds</span>
        </div>

        <input
          :checked="modelValue.taskInformationEnabled"
          class="p0-toggle"
          type="checkbox"
          @change="patch({ taskInformationEnabled: ($event.target as HTMLInputElement).checked })"
        >
      </label>
    </div>

    <div class="room-settings-section">
      <span class="settings-label">Round timer</span>

      <label class="toggle-item">
        <div class="toggle-info">
          <v-icon icon="mdi-timer-outline" size="15" style="color: var(--text-2)" />
          <span class="toggle-name">Enable round timer</span>
        </div>

        <input
          :checked="modelValue.timerEnabled"
          class="p0-toggle"
          type="checkbox"
          @change="patch({ timerEnabled: ($event.target as HTMLInputElement).checked })"
        >
      </label>

      <div v-if="modelValue.timerEnabled" class="timer-settings">
        <label class="toggle-item">
          <div class="toggle-info">
            <v-icon icon="mdi-eye-check-outline" size="15" style="color: var(--text-2)" />
            <span class="toggle-name">Reveal votes when timer ends</span>
          </div>

          <input
            :checked="modelValue.timerAutoRevealEnabled"
            class="p0-toggle"
            type="checkbox"
            @change="patch({ timerAutoRevealEnabled: ($event.target as HTMLInputElement).checked })"
          >
        </label>

        <div class="timer-config-group">
          <span class="timer-config-label">Mode</span>

          <div class="timer-config-controls timer-mode-controls">
            <v-btn-toggle
              class="timer-mode-toggle"
              density="compact"
              mandatory
              :model-value="modelValue.timerMode"
              variant="outlined"
              @update:model-value="patch({ timerMode: $event as RoomFormSettings['timerMode'] })"
            >
              <v-btn value="automatic">
                <v-icon icon="mdi-play-circle-outline" size="15" />
                Automatic
              </v-btn>

              <v-btn value="manual">
                <v-icon icon="mdi-hand-back-left-outline" size="15" />
                Manual
              </v-btn>
            </v-btn-toggle>

            <div class="timer-value-control">
              <v-text-field
                class="p0-field timer-number-field"
                hide-details="auto"
                inputmode="numeric"
                label="Duration"
                :model-value="modelValue.timerDurationSeconds"
                type="number"
                variant="outlined"
                @update:model-value="patchTimerDuration"
              />

              <span class="timer-unit-label">sec</span>
            </div>
          </div>
        </div>

        <div class="timer-config-group">
          <span class="timer-config-label">Warning</span>

          <div class="timer-config-controls timer-warning-controls">
            <label class="toggle-item timer-warning-toggle">
              <div class="toggle-info">
                <v-icon icon="mdi-alert-circle-outline" size="15" style="color: var(--text-2)" />
                <span class="toggle-name">Enable warning threshold</span>
              </div>

              <input
                :checked="modelValue.timerWarningEnabled"
                class="p0-toggle"
                type="checkbox"
                @change="patch({ timerWarningEnabled: ($event.target as HTMLInputElement).checked })"
              >
            </label>

            <template v-if="modelValue.timerWarningEnabled">
              <v-btn-toggle
                class="timer-mode-toggle"
                density="compact"
                mandatory
                :model-value="modelValue.timerWarningType"
                variant="outlined"
                @update:model-value="patch({ timerWarningType: $event as RoomFormSettings['timerWarningType'] })"
              >
                <v-btn value="seconds">
                  Seconds
                </v-btn>

                <v-btn value="percentage">
                  Percent
                </v-btn>
              </v-btn-toggle>

              <div class="timer-value-control">
                <v-text-field
                  class="p0-field timer-number-field"
                  hide-details="auto"
                  inputmode="numeric"
                  label="Value"
                  :model-value="modelValue.timerWarningValue"
                  type="number"
                  variant="outlined"
                  @update:model-value="patchTimerWarningValue"
                />

                <span class="timer-unit-label">{{ modelValue.timerWarningType === 'percentage' ? '%' : 'sec' }}</span>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <div class="room-settings-section">
      <span class="settings-label">Emoji reactions</span>

      <label class="toggle-item">
        <div class="toggle-info">
          <v-icon icon="mdi-emoticon-happy-outline" size="15" style="color: var(--text-2)" />
          <span class="toggle-name">Enable reaction bar</span>
        </div>

        <input
          :checked="modelValue.reactionsEnabled"
          class="p0-toggle"
          type="checkbox"
          @change="patch({ reactionsEnabled: ($event.target as HTMLInputElement).checked })"
        >
      </label>

      <div v-if="modelValue.reactionsEnabled" class="reaction-settings-grid">
        <label
          v-for="(_, index) in reactionEmojiSlots"
          :key="index"
          class="reaction-emoji-field"
        >
          <span>{{ index + 1 }}</span>

          <input
            :aria-label="`Reaction emoji ${index + 1}`"
            maxlength="8"
            :value="modelValue.reactionEmojis[index]"
            @input="patchReactionEmoji(index, ($event.target as HTMLInputElement).value)"
          >
        </label>
      </div>
    </div>

    <div class="room-settings-section">
      <span class="settings-label">Room control</span>

      <label class="toggle-item">
        <div class="toggle-info">
          <v-icon icon="mdi-crown-outline" size="15" style="color: var(--text-2)" />
          <span class="toggle-name">Enable leader mode</span>
        </div>

        <input
          :checked="modelValue.leaderModeEnabled"
          class="p0-toggle"
          type="checkbox"
          @change="patch({ leaderModeEnabled: ($event.target as HTMLInputElement).checked })"
        >
      </label>
    </div>
  </div>
</template>
