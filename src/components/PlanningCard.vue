<script setup lang="ts">
  import type { VoteValue } from '@/types/room'
  import type { Component } from 'vue'
  import { computed, markRaw, useAttrs } from 'vue'
  import CardClubIcon from './icons/CardClubIcon.vue'
  import CardDiamondIcon from './icons/CardDiamondIcon.vue'
  import CardHeartIcon from './icons/CardHeartIcon.vue'
  import CardSpadeIcon from './icons/CardSpadeIcon.vue'

  type CardClass = string | string[] | Record<string, boolean>

  const props = withDefaults(defineProps<{
    value?: VoteValue | null
    flipped?: boolean
    selected?: boolean
    selectable?: boolean
    disabled?: boolean
    compact?: boolean
    mini?: boolean
    shaking?: boolean
    additionalClasses?: CardClass
    flipDelay?: string
  }>(), {
    additionalClasses: '',
    compact: false,
    disabled: false,
    flipped: false,
    flipDelay: '0ms',
    mini: false,
    selectable: false,
    selected: false,
    shaking: false,
    value: null,
  })

  const emit = defineEmits<{
    select: [value: VoteValue]
  }>()

  defineOptions({
    inheritAttrs: false,
  })

  const attrs = useAttrs()
  const backSymbols: Component[] = [CardSpadeIcon, CardHeartIcon, CardDiamondIcon, CardClubIcon]
  const backSymbol = markRaw(backSymbols[Math.floor(Math.random() * backSymbols.length)])
  const hasValue = computed(() => props.value != null)
  const displayValue = computed(() => hasValue.value ? String(props.value) : '')

  function onSelect () {
    if (!props.selectable || props.disabled || props.value == null) return
    emit('select', props.value)
  }
</script>

<template>
  <component
    :is="selectable ? 'button' : 'div'"
    v-bind="attrs"
    class="planning-card"
    :class="[
      additionalClasses,
      {
        'planning-card-flipped': flipped,
        'planning-card-selected': selected,
        'planning-card-selectable': selectable,
        'planning-card-compact': compact,
        'planning-card-mini': mini,
        'planning-card-shaking': shaking,
        'planning-card-has-value': hasValue,
        'planning-card-empty': !hasValue,
      },
    ]"
    :data-card-value="value ?? undefined"
    :disabled="selectable ? disabled : undefined"
    :style="{ '--flip-delay': flipDelay }"
    :type="selectable ? 'button' : undefined"
    @click="onSelect"
  >
    <span class="planning-card-back">
      <component :is="backSymbol" aria-hidden="true" class="planning-card-symbol" />
    </span>

    <span class="planning-card-face">
      <span class="corner planning-card-corner planning-card-corner-tl tl">{{ displayValue }}</span>
      <span class="planning-card-main">{{ displayValue }}</span>
      <span class="corner planning-card-corner planning-card-corner-br br">{{ displayValue }}</span>
    </span>
  </component>
</template>
