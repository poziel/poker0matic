<script setup lang="ts">
  defineProps<{
    label: string
  }>()
</script>

<template>
  <div aria-hidden="true" class="labeled-separator">
    <span>{{ label }}</span>
  </div>
</template>
