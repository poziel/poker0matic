<template>
  <Teleport to="body">
    <Transition name="fullscreen-loader">
      <div v-if="modelValue" class="fullscreen-loader">
        <div class="loader-inner">
          <div class="loader-ring" />
          <span v-if="message" class="loader-msg">{{ message }}</span>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts" setup>
  defineProps<{
    modelValue: boolean
    message?: string
  }>()
</script>

<style scoped>
  .fullscreen-loader {
    position: fixed;
    inset: 0;
    background: var(--bg-base);
    display: grid;
    place-items: center;
    z-index: 9999;
  }

  .loader-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
  }

  .loader-ring {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    border: 2.5px solid var(--border-strong);
    border-top-color: var(--accent);
    animation: loader-spin 0.65s linear infinite;
  }

  @keyframes loader-spin {
    to { transform: rotate(360deg); }
  }

  .loader-msg {
    font-size: 12px;
    color: var(--text-3);
    font-family: var(--font-mono);
    margin: 0;
    letter-spacing: 0;
  }

  .fullscreen-loader-enter-active,
  .fullscreen-loader-leave-active {
    transition: opacity 0.18s ease;
  }

  .fullscreen-loader-enter-from,
  .fullscreen-loader-leave-to {
    opacity: 0;
  }
</style>
