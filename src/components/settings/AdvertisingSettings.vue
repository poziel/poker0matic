<template>
  <section class="settings-section-panel">
    <div class="settings-section-head">
      <h3>Advertising</h3>
      <p>Advertisements are optional and disabled by default.</p>
    </div>

    <label class="toggle-item">
      <div class="toggle-info">
        <span class="toggle-name">Enable advertisements</span>
        <small>Shows this deployment's Google AdSense banners.</small>
      </div>

      <input v-model="model.enableAds" class="p0-toggle" type="checkbox">
    </label>

    <p class="ad-settings-note">
      When disabled, Refinimo does not render ad containers or load Google ad scripts.
    </p>

    <p v-if="model.enableAds" class="ad-settings-thanks">
      Thank you for enabling ads. This helps support Refinimo and gives me more room to keep developing and improving the app.
    </p>
  </section>
</template>

<script lang="ts" setup>
  import type { SettingsDraft } from '@/components/settings/types'

  const model = defineModel<SettingsDraft>({ required: true })
</script>

<style scoped>
  .ad-settings-note {
    color: var(--text-3);
    font-size: 12px;
    line-height: 1.45;
    margin: 0;
  }

  .ad-settings-thanks {
    background: color-mix(in oklab, var(--accent), transparent 88%);
    border: 1px solid color-mix(in oklab, var(--accent), transparent 68%);
    border-radius: 8px;
    color: var(--text-2);
    font-size: 12.5px;
    line-height: 1.5;
    margin: 0;
    padding: 10px 12px;
  }
</style>
