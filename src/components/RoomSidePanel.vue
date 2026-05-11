<script setup lang="ts">
  import type { RoomHistoryEntry, TaskInfo } from '@/types/room'
  import { computed, ref } from 'vue'

  const props = defineProps<{
    open: boolean
    history: RoomHistoryEntry[]
    historyEnabled: boolean
    taskInformationEnabled: boolean
    currentTask: TaskInfo | null
  }>()

  defineEmits<{
    'update:open': [value: boolean]
  }>()

  const historyExpanded = ref(true)
  const taskExpanded = ref(true)

  const reversedHistory = computed(() => props.history.toReversed())

  function formatDuration (entry: RoomHistoryEntry): string {
    if (entry.durationMs != null) {
      const ms = entry.durationMs
      if (ms < 60_000) return `${Math.round(ms / 1000)}s`
      const m = Math.floor(ms / 60_000)
      const s = Math.round((ms % 60_000) / 1000)
      return s > 0 ? `${m}m ${s}s` : `${m}m`
    }
    return entry.duration ?? '-'
  }

  function formatDate (ts: number | undefined): string {
    if (!ts || !Number.isFinite(ts)) return ''
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(ts))
  }

  function historyLabel (entry: RoomHistoryEntry): string {
    return entry.title?.trim() || `Round ${entry.round}`
  }
</script>

<template>
  <aside class="side-panel" :class="{ 'side-panel-collapsed': !open }">
    <div class="side-panel-head">
      <span v-if="open" class="side-panel-title">Room panel</span>

      <v-btn
        aria-label="Close panel"
        class="icon-btn"
        density="compact"
        icon
        title="Close panel"
        variant="text"
        @click="$emit('update:open', !open)"
      >
        <v-icon icon="mdi-backburger" size="16" />
      </v-btn>
    </div>

    <div v-if="open" class="side-panel-scroll">
      <div v-if="taskInformationEnabled" class="sp-section">
        <button class="sp-section-head" type="button" @click="taskExpanded = !taskExpanded">
          <v-icon icon="mdi-text-box-search-outline" size="14" />
          <span>Task information</span>
          <v-icon class="sp-chevron" :icon="taskExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down'" size="14" />
        </button>

        <div v-if="taskExpanded" class="sp-section-body task-info-body">
          <template v-if="currentTask">
            <div class="task-info-item">
              <span class="task-info-label">Title</span>
              <strong class="task-info-value">{{ currentTask.title }}</strong>
            </div>

            <div class="task-info-item">
              <span class="task-info-label">URL</span>

              <a
                v-if="currentTask.url"
                class="task-info-link"
                :href="currentTask.url"
                rel="noreferrer"
                target="_blank"
              >
                {{ currentTask.url }}
              </a>

              <span v-else class="task-info-empty">No link provided</span>
            </div>

            <div v-if="currentTask.description" class="task-info-item">
              <span class="task-info-label">Description</span>
              <p class="task-info-description">{{ currentTask.description }}</p>
            </div>
          </template>

          <div v-else class="hist-empty">
            No task information has been added for this round yet
          </div>
        </div>
      </div>

      <div v-if="historyEnabled" class="sp-section">
        <button class="sp-section-head" type="button" @click="historyExpanded = !historyExpanded">
          <v-icon icon="mdi-history" size="14" />
          <span>History</span>
          <span class="sp-badge">{{ history.length }}</span>
          <v-icon class="sp-chevron" :icon="historyExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down'" size="14" />
        </button>

        <div v-if="historyExpanded" class="sp-section-body sp-history-body">
          <div
            v-for="entry in reversedHistory"
            :key="entry.id"
            class="hist-item"
          >
            <div class="top">
              <span class="hid">{{ historyLabel(entry) }}</span>
              <span class="hvote">{{ entry.finalVote ?? '-' }}</span>
            </div>

            <div v-if="entry.url" class="hurl">
              <a class="task-info-link" :href="entry.url" rel="noreferrer" target="_blank">{{ entry.url }}</a>
            </div>

            <p v-if="entry.description" class="task-info-description hdesc">{{ entry.description }}</p>

            <div v-if="entry.avg != null || entry.closest != null" class="hstats">
              <span v-if="entry.avg != null">Avg <strong>{{ entry.avg }}</strong></span>
              <span v-if="entry.closest != null">Closest <strong>{{ entry.closest }}</strong></span>
            </div>

            <div class="hmeta">
              <span>{{ entry.participantCount }} players · {{ formatDuration(entry) }}</span>

              <span :class="entry.consensus === 'yes' ? 'history-agreed' : 'history-split'">
                {{ entry.consensus === 'yes' ? 'consensus' : 'split' }}
              </span>
            </div>

            <div v-if="entry.completedAt" class="hdate">{{ formatDate(entry.completedAt) }}</div>
          </div>

          <div v-if="history.length === 0" class="hist-empty">
            No rounds completed yet
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>
