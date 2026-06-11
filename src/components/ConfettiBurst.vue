<script setup lang="ts">
  interface ConfettiPiece {
    id: string
    left: number
    top: number
    bg: string
    rotation: number
    shape: string
  }

  defineProps<{
    pieces: ConfettiPiece[]
  }>()
</script>

<template>
  <div
    aria-hidden="true"
    class="confetti-host"
    data-test-id="consensus-confetti"
  >
    <span
      v-for="piece in pieces"
      :key="piece.id"
      class="confetti-piece"
      :style="{
        '--confetti-rotation': `${piece.rotation}deg`,
        left: `${piece.left}%`,
        top: `${piece.top}%`,
        background: piece.bg,
        borderRadius: piece.shape,
      }"
    />
  </div>
</template>
