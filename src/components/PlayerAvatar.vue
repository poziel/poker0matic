<template>
  <span
    class="player-avatar-frame"
    :style="frameStyle"
  >
    <img
      :alt="avatarSeed"
      :src="src"
      :style="imageStyle"
      @error="onImageError"
    >
  </span>
</template>

<script lang="ts" setup>
  import type { CSSProperties } from 'vue'
  import { computed, ref, watch } from 'vue'
  import { type AvatarCrop, type AvatarSource, buildAvatarUrl, DEFAULT_AVATAR_BG, DEFAULT_AVATAR_CROP, DEFAULT_AVATAR_SOURCE, isValidCustomAvatarUrl, normalizeAvatarCrop, THEME_BG_VALUE } from '@/utils/avatarStyles'

  const props = defineProps<{
    /** DiceBear style ID (e.g. 'notionists-neutral') */
    avatarStyle: string
    /** Seed string used to generate the avatar */
    avatarSeed: string
    /** Optional custom background hex color. Falls back to DEFAULT_AVATAR_BG. */
    avatarBg?: string
    avatarSource?: AvatarSource
    customAvatarUrl?: string | null
    customAvatarCrop?: AvatarCrop | null
    size?: number
    square?: boolean
  }>()

  const customLoadFailed = ref(false)
  const size = computed(() => props.size ?? 64)
  const fallbackSrc = computed(() => buildAvatarUrl(props.avatarStyle, props.avatarSeed))
  const customSrc = computed(() => props.customAvatarUrl?.trim() ?? '')
  const isCustomAvatar = computed(() => (
    (props.avatarSource ?? DEFAULT_AVATAR_SOURCE) === 'custom'
    && isValidCustomAvatarUrl(customSrc.value)
    && !customLoadFailed.value
  ))
  const src = computed(() => (
    isCustomAvatar.value
      ? customSrc.value
      : fallbackSrc.value
  ))
  const crop = computed(() => (
    isCustomAvatar.value
      ? normalizeAvatarCrop(props.customAvatarCrop) ?? DEFAULT_AVATAR_CROP
      : DEFAULT_AVATAR_CROP
  ))
  const frameStyle = computed<CSSProperties>(() => ({
    width: `${size.value}px`,
    height: `${size.value}px`,
    borderRadius: props.square ? '7px' : '50%',
    backgroundColor: bg.value,
  }))
  const imageStyle = computed<CSSProperties>(() => ({
    display: 'block',
    position: 'absolute',
    maxWidth: 'none',
    objectFit: 'fill',
    width: `${100 / crop.value.width}%`,
    height: `${100 / crop.value.height}%`,
    left: `${-(crop.value.left / crop.value.width) * 100}%`,
    top: `${-(crop.value.top / crop.value.height) * 100}%`,
  }))
  const bg = computed(() => {
    if (!props.avatarBg || props.avatarBg === THEME_BG_VALUE) {
      // 'theme' sentinel → lighter version of the viewer's own accent color
      return props.avatarBg === THEME_BG_VALUE
        ? 'color-mix(in oklab, var(--accent), white 38%)'
        : DEFAULT_AVATAR_BG
    }
    return props.avatarBg
  })

  watch(
    [() => props.avatarSource, customSrc],
    () => {
      customLoadFailed.value = false
    },
  )

  function onImageError () {
    if ((props.avatarSource ?? DEFAULT_AVATAR_SOURCE) === 'custom' && src.value === customSrc.value) {
      customLoadFailed.value = true
    }
  }
</script>
