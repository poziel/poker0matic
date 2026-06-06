<template>
  <v-dialog v-model="model" max-width="900">
    <v-card class="p0-modal settings-modal" flat>
      <div class="p0-modal-head settings-modal-head">
        <div>
          <h2>{{ title }}</h2>
          <p>{{ description }}</p>
        </div>

        <v-btn
          :aria-label="`Close ${title.toLowerCase()}`"
          class="icon-btn"
          icon="mdi-close"
          size="small"
          :title="`Close ${title.toLowerCase()}`"
          variant="flat"
          @click="model = false"
        />
      </div>

      <div class="settings-modal-layout">
        <nav :aria-label="`${title} sections`" class="settings-sidebar">
          <button
            v-for="section in sections"
            :key="section.id"
            class="settings-sidebar-item"
            :class="{ active: activeSection === section.id }"
            :data-test-id="`settings-section-${section.id}`"
            type="button"
            @click="activeSection = section.id"
          >
            <v-icon :icon="section.icon" size="17" />
            <span>{{ section.label }}</span>
          </button>
        </nav>

        <div class="settings-content p0-scrollbar">
          <slot />
        </div>
      </div>

      <div class="p0-modal-foot">
        <slot name="footer" />
      </div>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
  export interface SettingsModalSection {
    id: string
    label: string
    icon: string
  }

  defineProps<{
    title: string
    description: string
    sections: readonly SettingsModalSection[]
  }>()

  const model = defineModel<boolean>({ required: true })
  const activeSection = defineModel<string>('activeSection', { required: true })
</script>
