<template>
  <span
    class="player-avatar-frame"
    :style="frameStyle"
  >
    <img
      :alt="avatarSeed || 'Player avatar'"
      :src="src"
      :style="imageStyle"
      @error="onImageError"
    >
  </span>
</template>

<script lang="ts" setup>
  import type { CSSProperties } from 'vue'
  import { computed, ref, watch } from 'vue'
  import { useAppStore } from '@/stores/app'
  import { type AvatarCrop, type AvatarSource, buildAvatarUrl, DEFAULT_AVATAR_BG, DEFAULT_AVATAR_CROP, DEFAULT_AVATAR_SOURCE, DEFAULT_AVATAR_STYLE, isValidCustomAvatarUrl, normalizeAvatarCrop, resolveAvatarBackgroundColor } from '@/utils/avatarStyles'

  const props = defineProps<{
    /** DiceBear style ID (e.g. 'notionists-neutral') */
    avatarStyle?: string
    /** Seed string used to generate the avatar */
    avatarSeed?: string
    /** Optional custom background hex color. Falls back to DEFAULT_AVATAR_BG. */
    avatarBg?: string
    /** Render-ready avatar URL stored in room state. */
    avatarUrl?: string | null
    /** Optional crop for render-ready avatar URL. */
    avatarCrop?: AvatarCrop | null
    avatarSource?: AvatarSource
    customAvatarUrl?: string | null
    customAvatarCrop?: AvatarCrop | null
    size?: number
    square?: boolean
  }>()

  const appStore = useAppStore()
  const customLoadFailed = ref(false)
  const size = computed(() => props.size ?? 64)
  const fallbackSrc = computed(() => buildAvatarUrl(
    props.avatarStyle ?? DEFAULT_AVATAR_STYLE,
    props.avatarSeed || 'Guest',
    bg.value,
  ))
  const avatarSrc = computed(() => props.avatarUrl?.trim() ?? '')
  const customSrc = computed(() => props.customAvatarUrl?.trim() ?? '')
  const hasAvatarUrl = computed(() => (
    isValidCustomAvatarUrl(avatarSrc.value)
    && !customLoadFailed.value
  ))
  const isCustomAvatar = computed(() => (
    (props.avatarSource ?? DEFAULT_AVATAR_SOURCE) === 'custom'
    && isValidCustomAvatarUrl(customSrc.value)
    && !customLoadFailed.value
  ))
  const src = computed(() => {
    if (hasAvatarUrl.value) return avatarSrc.value
    if (isCustomAvatar.value) return customSrc.value
    return fallbackSrc.value
  })
  const crop = computed(() => {
    if (hasAvatarUrl.value) return normalizeAvatarCrop(props.avatarCrop) ?? DEFAULT_AVATAR_CROP
    if (isCustomAvatar.value) return normalizeAvatarCrop(props.customAvatarCrop) ?? DEFAULT_AVATAR_CROP
    return DEFAULT_AVATAR_CROP
  })
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
  const bg = computed(() => resolveAvatarBackgroundColor(
    props.avatarBg || DEFAULT_AVATAR_BG,
    appStore.currentTheme,
  ))

  watch(
    [avatarSrc, () => props.avatarSource, customSrc],
    () => {
      customLoadFailed.value = false
    },
  )

  function onImageError () {
    if (src.value === customSrc.value) {
      customLoadFailed.value = true
    }
  }
</script>
