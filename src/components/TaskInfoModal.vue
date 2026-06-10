<script setup lang="ts">
  import type { TaskInfo } from '@/types/room'
  import { ref, watch } from 'vue'

  const props = defineProps<{
    modelValue: boolean
    title: string
    message: string
    submitLabel: string
    initialTask?: TaskInfo | null
  }>()

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    'save': [task: TaskInfo]
  }>()

  const task = ref<TaskInfo>({
    title: '',
    url: null,
    description: '',
  })

  watch(() => props.modelValue, open => {
    if (!open) return
    task.value = {
      title: props.initialTask?.title ?? '',
      url: props.initialTask?.url ?? null,
      description: props.initialTask?.description ?? '',
    }
  }, { immediate: true })

  function save () {
    const title = task.value.title.trim()
    const url = task.value.url?.trim() ?? ''
    const description = task.value.description?.trim() ?? ''

    if (!title) return

    emit('save', {
      title,
      url: url || null,
      description: description || null,
    })
  }
</script>

<template>
  <v-dialog
    max-width="560"
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card class="ui-modal" flat>
      <div class="ui-modal-head">
        <h2>{{ title }}</h2>
        <p>{{ message }}</p>
      </div>

      <v-form @submit.prevent="save">
        <div class="ui-modal-body">
          <div class="task-info-form">
            <v-text-field
              autofocus
              class="ui-field"
              hide-details="auto"
              label="Task title"
              maxlength="120"
              :model-value="task.title"
              placeholder="e.g. Implement room share links"
              required
              variant="outlined"
              @update:model-value="task.title = $event"
            />

            <v-text-field
              class="ui-field"
              hide-details="auto"
              label="Task URL"
              maxlength="500"
              :model-value="task.url"
              placeholder="Optional tracker link"
              variant="outlined"
              @update:model-value="task.url = $event"
            />

            <v-textarea
              class="ui-field"
              hide-details="auto"
              label="Task description"
              :model-value="task.description"
              placeholder="Optional context, acceptance criteria, or notes"
              rows="5"
              variant="outlined"
              @update:model-value="task.description = $event"
            />
          </div>
        </div>

        <div class="ui-modal-foot">
          <v-btn
            class="ui-btn ui-btn-ghost"
            variant="flat"
            @click="$emit('update:modelValue', false)"
          >
            Cancel
          </v-btn>

          <v-btn
            class="ui-btn ui-btn-primary"
            :disabled="!task.title.trim()"
            prepend-icon="mdi-content-save"
            type="submit"
            variant="flat"
          >
            {{ submitLabel }}
          </v-btn>
        </div>
      </v-form>
    </v-card>
  </v-dialog>
</template>
