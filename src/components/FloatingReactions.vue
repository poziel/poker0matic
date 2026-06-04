<script setup lang="ts">
  import type { FloatingReaction } from '@/utils/reactions'

  defineProps<{
    reactions: FloatingReaction[]
  }>()
</script>

<template>
  <div aria-hidden="true" class="floating-reactions">
    <span
      v-for="reaction in reactions"
      :key="reaction.id"
      class="float-react"
      :style="{
        left: `${reaction.x}px`,
        top: `${reaction.y}px`,
        '--reaction-drift': `${reaction.drift}px`,
        '--reaction-duration': `${reaction.durationMs}ms`,
      }"
    >
      {{ reaction.emoji }}
    </span>
  </div>
</template>
