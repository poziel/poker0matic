<template>
  <section class="settings-section-panel">
    <div class="settings-section-head">
      <h3>Avatar</h3>
      <p>Choose how your avatar looks for everyone in the room.</p>
    </div>

    <div aria-label="Avatar source" class="avatar-source-selector" role="group">
      <button
        class="avatar-source-option"
        :class="{ active: model.avatarSource === 'dicebear' }"
        data-test-id="avatar-source-dicebear"
        type="button"
        @click="model.avatarSource = 'dicebear'"
      >
        DiceBear
      </button>

      <button
        class="avatar-source-option"
        :class="{ active: model.avatarSource === 'custom' }"
        data-test-id="avatar-source-custom"
        type="button"
        @click="model.avatarSource = 'custom'"
      >
        Image URL
      </button>
    </div>

    <div class="avatar-controls">
      <div v-if="model.avatarSource === 'custom'" class="custom-avatar-controls">
        <PlayerAvatar
          :avatar-bg="effectiveBg"
          :avatar-seed="effectiveSeed"
          :avatar-source="model.avatarSource"
          :avatar-style="model.avatarStyle"
          :custom-avatar-crop="model.customAvatarCrop"
          :custom-avatar-url="model.customAvatarUrl"
          :size="72"
        />

        <v-text-field
          v-model="localCustomAvatarUrl"
          class="p0-field custom-avatar-url-field"
          data-test-id="avatar-custom-url-input"
          hide-details="auto"
          label="Externally hosted image URL"
          placeholder="https://example.com/avatar.png"
          type="url"
          variant="outlined"
        />

        <p class="avatar-seed-hint">
          Poker0matic stores this URL and crop only. If the image is missing, invalid, or cannot load, your generated avatar is shown.
        </p>

        <p
          v-if="moderationMessage"
          class="avatar-moderation-status"
          :class="`avatar-moderation-status-${model.customAvatarModerationStatus}`"
        >
          {{ moderationMessage }}
        </p>

        <div v-if="canCropCustomAvatar" class="custom-avatar-cropper-wrap">
          <Cropper
            :canvas="false"
            class="custom-avatar-cropper"
            data-test-id="avatar-custom-cropper"
            :debounce="60"
            :default-position="defaultCropPosition"
            :default-size="defaultCropSize"
            :src="model.customAvatarUrl"
            :stencil-props="stencilProps"
            @change="onCropChange"
          />
        </div>
      </div>

      <div v-show="model.avatarSource === 'dicebear'" class="avatar-seed-input-row">
        <input
          v-model="localAvatarSeed"
          class="avatar-seed-native"
          data-test-id="avatar-seed-input"
          :placeholder="`${displayName} (default seed)`"
          type="text"
          @keydown.enter="applyPreview"
        >

        <button class="avatar-preview-btn" data-test-id="avatar-preview" type="button" @click="applyPreview">Preview</button>

        <button
          aria-label="Randomize avatar seed"
          class="avatar-randomize-btn"
          data-test-id="avatar-randomize-seed"
          title="Randomize avatar seed"
          type="button"
          @click="randomizeAvatarSeed"
        >
          <v-icon icon="mdi-dice-multiple" size="18" />
        </button>
      </div>

      <label v-show="model.avatarSource === 'dicebear'" class="toggle-item">
        <div class="toggle-info">
          <span class="toggle-name">Follow theme accent</span>
        </div>

        <input v-model="avatarBgFollowTheme" class="p0-toggle" type="checkbox">
      </label>

      <label v-if="model.avatarSource === 'dicebear' && !avatarBgFollowTheme" class="avatar-bg-picker">
        <input
          v-model="localAvatarBg"
          class="avatar-color-input"
          type="color"
        >

        <span class="avatar-bg-label">Custom background</span>

        <code class="avatar-color-hex">{{ localAvatarBg }}</code>
      </label>

      <p v-show="model.avatarSource === 'dicebear'" class="avatar-seed-hint">
        Your username is the default seed. The background shows through transparent avatar styles.
      </p>
    </div>

    <div v-show="model.avatarSource === 'dicebear'" class="avatar-style-grid" data-test-id="avatar-style-grid">
      <button
        v-for="style in AVATAR_STYLES"
        :key="style.id"
        class="avatar-style-card"
        :class="{ active: model.avatarStyle === style.id }"
        type="button"
        @click="model.avatarStyle = style.id"
      >
        <span v-if="style.recommended" class="avatar-style-rec">Recommended</span>

        <PlayerAvatar
          :avatar-bg="effectiveBg"
          :avatar-seed="effectiveSeed"
          :avatar-style="style.id"
          :size="56"
        />

        <span class="avatar-style-label">{{ style.label }}</span>
      </button>
    </div>

  </section>
</template>

<script lang="ts" setup>
  import type { SettingsDraft } from '@/components/settings/types'
  import type { Coordinates, CropperResult, ImageSize } from 'vue-advanced-cropper'
  import { computed, onBeforeUnmount, ref, watch } from 'vue'
  import { Cropper } from 'vue-advanced-cropper'
  import PlayerAvatar from '@/components/PlayerAvatar.vue'
  import { type AvatarModerationResult, formatModerationScore, isModerationResultBlocking, moderateCustomAvatarUrl } from '@/utils/avatarModeration'
  import { AVATAR_STYLES, type AvatarCrop, DEFAULT_AVATAR_BG, isValidCustomAvatarUrl, THEME_BG_VALUE } from '@/utils/avatarStyles'
  import 'vue-advanced-cropper/dist/style.css'

  const model = defineModel<SettingsDraft>({ required: true })
  const localAvatarSeed = ref(model.value.avatarSeed)
  const previewSeed = ref(model.value.avatarSeed)
  const localCustomAvatarUrl = ref(model.value.customAvatarUrl)
  const moderationResult = ref<AvatarModerationResult | null>(null)
  const avatarBgFollowTheme = ref(model.value.avatarBg === THEME_BG_VALUE)
  const localAvatarBg = ref(
    model.value.avatarBg === THEME_BG_VALUE ? DEFAULT_AVATAR_BG : model.value.avatarBg,
  )

  const displayName = computed(() => model.value.userName.trim() || 'Guest')
  const effectiveBg = computed(() => avatarBgFollowTheme.value ? THEME_BG_VALUE : localAvatarBg.value)
  const effectiveSeed = computed(() => previewSeed.value.trim() || displayName.value)
  const canCropCustomAvatar = computed(() => (
    model.value.avatarSource === 'custom'
    && isValidCustomAvatarUrl(model.value.customAvatarUrl)
  ))
  const moderationMessage = computed(() => {
    if (model.value.avatarSource !== 'custom' || !model.value.customAvatarUrl.trim()) return ''
    if (!isValidCustomAvatarUrl(model.value.customAvatarUrl)) return 'Enter a valid http or https image URL.'
    if (model.value.customAvatarModerationStatus === 'checking') return 'Checking image content...'
    if (model.value.customAvatarModerationStatus === 'approved') {
      const score = formatModerationScore(moderationResult.value)
      return score ? `Image check passed. NSFW score: ${score}.` : 'Image check passed.'
    }
    if (model.value.customAvatarModerationStatus === 'blocked') {
      return moderationResult.value?.reason ?? 'This image is not allowed as a player avatar.'
    }
    if (model.value.customAvatarModerationStatus === 'unavailable') {
      return moderationResult.value?.reason ?? 'This image could not be checked in the browser.'
    }
    return ''
  })
  const stencilProps = {
    aspectRatio: 1,
    handlers: {
      eastNorth: true,
      eastSouth: true,
      westNorth: true,
      westSouth: true,
    },
    lines: {
      east: true,
      north: true,
      south: true,
      west: true,
    },
    movable: true,
    resizable: true,
  }

  let moderationTimer: ReturnType<typeof setTimeout> | null = null
  let moderationRequestId = 0

  watch(
    [() => model.value.avatarSeed, () => model.value.avatarBg],
    ([seed, bg]) => {
      localAvatarSeed.value = seed
      previewSeed.value = seed
      avatarBgFollowTheme.value = bg === THEME_BG_VALUE
      localAvatarBg.value = bg === THEME_BG_VALUE ? DEFAULT_AVATAR_BG : bg
    },
  )

  watch(() => model.value.customAvatarUrl, url => {
    localCustomAvatarUrl.value = url
  })

  function applyPreview () {
    previewSeed.value = localAvatarSeed.value
    model.value.avatarSeed = localAvatarSeed.value
  }

  function randomizeAvatarSeed () {
    const seed = createRandomAvatarSeed()
    localAvatarSeed.value = seed
    previewSeed.value = seed
    model.value.avatarSeed = seed
  }

  watch(localAvatarSeed, seed => {
    model.value.avatarSeed = seed
  })

  watch(avatarBgFollowTheme, followTheme => {
    model.value.avatarBg = followTheme ? THEME_BG_VALUE : localAvatarBg.value
  })

  watch(localAvatarBg, bg => {
    if (!avatarBgFollowTheme.value) {
      model.value.avatarBg = bg
    }
  })

  watch(localCustomAvatarUrl, url => {
    const previousUrl = model.value.customAvatarUrl.trim()
    const nextUrl = url.trim()
    model.value.customAvatarUrl = url
    if (nextUrl !== previousUrl) {
      model.value.customAvatarCrop = null
    }
    scheduleModeration(nextUrl)
  })

  watch(() => model.value.avatarSource, source => {
    if (source === 'custom') {
      scheduleModeration(model.value.customAvatarUrl.trim())
    }
  })

  onBeforeUnmount(() => {
    if (moderationTimer !== null) clearTimeout(moderationTimer)
  })

  function onCropChange (result: CropperResult) {
    if (!result.image.width || !result.image.height) return
    model.value.customAvatarCrop = normalizeCropResult(result)
  }

  function defaultCropPosition ({
    coordinates,
    imageSize,
  }: {
    coordinates: Coordinates
    imageSize: ImageSize
  }): Pick<AvatarCrop, 'left' | 'top'> {
    const crop = model.value.customAvatarCrop
    if (!crop) {
      return {
        left: (imageSize.width - coordinates.width) / 2,
        top: (imageSize.height - coordinates.height) / 2,
      }
    }
    return {
      left: crop.left * imageSize.width,
      top: crop.top * imageSize.height,
    }
  }

  function defaultCropSize ({
    imageSize,
  }: {
    imageSize: ImageSize
  }): Pick<AvatarCrop, 'width' | 'height'> {
    const crop = model.value.customAvatarCrop
    if (!crop) {
      const size = Math.min(imageSize.width, imageSize.height) * 0.8
      return { width: size, height: size }
    }
    return {
      width: crop.width * imageSize.width,
      height: crop.height * imageSize.height,
    }
  }

  function normalizeCropResult (result: CropperResult): AvatarCrop {
    return {
      left: result.coordinates.left / result.image.width,
      top: result.coordinates.top / result.image.height,
      width: result.coordinates.width / result.image.width,
      height: result.coordinates.height / result.image.height,
    }
  }

  function createRandomAvatarSeed (): string {
    if (globalThis.crypto?.getRandomValues) {
      const values = new Uint32Array(2)
      globalThis.crypto.getRandomValues(values)
      return `avatar-${values[0].toString(36)}-${values[1].toString(36)}`
    }

    const first = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(36)
    const second = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(36)
    return `avatar-${first}-${second}`
  }

  function scheduleModeration (url: string) {
    if (moderationTimer !== null) clearTimeout(moderationTimer)
    moderationResult.value = null
    moderationRequestId += 1

    if (!url || !isValidCustomAvatarUrl(url)) {
      model.value.customAvatarModerationStatus = url ? 'unavailable' : 'idle'
      return
    }

    model.value.customAvatarModerationStatus = 'checking'
    const requestId = moderationRequestId
    moderationTimer = setTimeout(() => {
      void moderateCustomAvatarUrl(url).then(result => {
        if (requestId !== moderationRequestId) return
        moderationResult.value = result
        model.value.customAvatarModerationStatus = isModerationResultBlocking(result)
          ? 'blocked'
          : result.status
      })
    }, 500)
  }

  if (model.value.avatarSource === 'custom') {
    scheduleModeration(model.value.customAvatarUrl.trim())
  }
</script>
