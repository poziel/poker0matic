<template>
  <section class="settings-section-panel">
    <div class="settings-section-head">
      <h3>Avatar</h3>
      <p>Choose how your avatar looks for everyone in the room.</p>
    </div>

    <div class="avatar-controls">
      <div class="avatar-seed-input-row">
        <input
          v-model="localAvatarSeed"
          class="avatar-seed-native"
          :placeholder="`${displayName} (default seed)`"
          type="text"
          @keydown.enter="applyPreview"
        >

        <button class="avatar-preview-btn" type="button" @click="applyPreview">Preview</button>
      </div>

      <label class="toggle-item">
        <div class="toggle-info">
          <span class="toggle-name">Follow theme accent</span>
        </div>

        <input v-model="avatarBgFollowTheme" class="p0-toggle" type="checkbox">
      </label>

      <label v-if="!avatarBgFollowTheme" class="avatar-bg-picker">
        <input
          v-model="localAvatarBg"
          class="avatar-color-input"
          type="color"
        >

        <span class="avatar-bg-label">Custom background</span>

        <code class="avatar-color-hex">{{ localAvatarBg }}</code>
      </label>

      <p class="avatar-seed-hint">
        Your username is the default seed. The background shows through transparent avatar styles.
      </p>
    </div>

    <div class="avatar-style-grid">
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
  import { computed, ref, watch } from 'vue'
  import PlayerAvatar from '@/components/PlayerAvatar.vue'
  import { AVATAR_STYLES, DEFAULT_AVATAR_BG, THEME_BG_VALUE } from '@/utils/avatarStyles'

  const model = defineModel<SettingsDraft>({ required: true })
  const localAvatarSeed = ref(model.value.avatarSeed)
  const previewSeed = ref(model.value.avatarSeed)
  const avatarBgFollowTheme = ref(model.value.avatarBg === THEME_BG_VALUE)
  const localAvatarBg = ref(
    model.value.avatarBg === THEME_BG_VALUE ? DEFAULT_AVATAR_BG : model.value.avatarBg,
  )

  const displayName = computed(() => model.value.userName.trim() || 'Guest')
  const effectiveBg = computed(() => avatarBgFollowTheme.value ? THEME_BG_VALUE : localAvatarBg.value)
  const effectiveSeed = computed(() => previewSeed.value.trim() || displayName.value)

  watch(
    [() => model.value.avatarSeed, () => model.value.avatarBg],
    ([seed, bg]) => {
      localAvatarSeed.value = seed
      previewSeed.value = seed
      avatarBgFollowTheme.value = bg === THEME_BG_VALUE
      localAvatarBg.value = bg === THEME_BG_VALUE ? DEFAULT_AVATAR_BG : bg
    },
  )

  function applyPreview () {
    previewSeed.value = localAvatarSeed.value
    model.value.avatarSeed = localAvatarSeed.value
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
</script>
