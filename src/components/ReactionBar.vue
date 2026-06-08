<script setup lang="ts">
  defineProps<{
    reactions: readonly string[]
  }>()

  defineEmits<{
    react: [emoji: string]
  }>()
</script>

<template>
  <div
    aria-label="Quick reactions"
    class="reaction-bar"
  >
    <span class="reaction-label">React</span>

    <div class="reaction-buttons">
      <button
        v-for="emoji in reactions"
        :key="emoji"
        :aria-label="`Send ${emoji} reaction`"
        class="reaction-btn"
        type="button"
        @click="$emit('react', emoji)"
      >
        {{ emoji }}
      </button>
    </div>
  </div>
</template>
