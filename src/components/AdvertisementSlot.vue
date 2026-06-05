<template>
  <aside
    :aria-label="label"
    class="ad-slot"
    :class="`ad-slot-${placement}`"
  >
    <ins
      v-if="canRequestAd"
      ref="adElement"
      class="adsbygoogle"
      :data-ad-client="publisherId"
      data-ad-format="auto"
      :data-ad-slot="slotId"
      data-full-width-responsive="true"
      style="display:block"
    />

    <div v-else class="ad-slot-empty">
      <span class="ad-slot-label">AdSense</span>

      <div class="ad-slot-copy">
        <strong>Advertising unavailable</strong>
        <span>This deployment has not configured its Google AdSense ad units.</span>
      </div>
    </div>
  </aside>
</template>

<script lang="ts" setup>
  import type { AdvertisementPlacement } from '@/utils/advertisements'
  import { computed, nextTick, ref, watch } from 'vue'
  import { useConfigStore } from '@/stores/config'
  import {
    getAdSensePlacementConfig,
    getAdvertisementLabel,
    isAdSensePublisherId,
    isAdSenseSlotId,
    loadGoogleAdSense,
    requestGoogleAdSenseFill,
  } from '@/utils/advertisements'

  const props = defineProps<{
    placement: AdvertisementPlacement
  }>()

  const configStore = useConfigStore()
  const adElement = ref<HTMLElement | null>(null)
  const adConfig = computed(() => getAdSensePlacementConfig(props.placement))
  const publisherId = computed(() => adConfig.value.publisherId)
  const slotId = computed(() => adConfig.value.slotId)
  const label = computed(() => getAdvertisementLabel(props.placement))
  const canRequestAd = computed(() => (
    configStore.enableAds
    && isAdSensePublisherId(publisherId.value)
    && isAdSenseSlotId(slotId.value)
  ))

  let requestedAdKey = ''

  watch(
    () => `${canRequestAd.value}:${publisherId.value}:${slotId.value}:${props.placement}`,
    () => {
      void requestAd()
    },
    { immediate: true },
  )

  async function requestAd () {
    if (!canRequestAd.value) return

    const adKey = `${publisherId.value}:${slotId.value}:${props.placement}`
    if (requestedAdKey === adKey) return

    await nextTick()
    if (!adElement.value) return

    try {
      await loadGoogleAdSense(publisherId.value)
      requestGoogleAdSenseFill()
      requestedAdKey = adKey
    } catch (error) {
      console.error(error)
    }
  }
</script>

<style scoped>
  .ad-slot {
    align-items: center;
    background: var(--bg-1);
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--text-1);
    display: flex;
    gap: 12px;
    min-height: 96px;
    padding: 10px 12px;
  }

  .ad-slot-app-banner {
    margin-top: 18px;
    width: min(728px, 100%);
  }

  .ad-slot-room-support {
    align-self: stretch;
    margin: 4px auto 12px;
    max-width: min(728px, 100%);
    width: 100%;
  }

  .adsbygoogle {
    min-height: 90px;
    width: 100%;
  }

  .ad-slot-empty {
    align-items: center;
    display: flex;
    gap: 12px;
    width: 100%;
  }

  .ad-slot-label {
    border: 1px solid color-mix(in oklab, var(--accent), transparent 62%);
    border-radius: 6px;
    color: var(--accent);
    flex-shrink: 0;
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0;
    line-height: 1;
    padding: 5px 7px;
    text-transform: uppercase;
  }

  .ad-slot-copy {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .ad-slot-copy strong {
    color: var(--text-1);
    font-size: 13px;
    font-weight: 650;
    line-height: 1.25;
  }

  .ad-slot-copy span {
    color: var(--text-3);
    font-size: 12px;
    line-height: 1.35;
  }

  @media (max-width: 620px) {
    .ad-slot-empty {
      align-items: flex-start;
      flex-direction: column;
    }
  }
</style>
