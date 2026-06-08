<script setup lang="ts">
  import { computed, ref } from 'vue'

  interface RoundStats {
    avg: number | null
    median: number | null
    closest: number | null
    min: number | null
    max: number | null
    spread: number | null
    counts: Record<string, number>
    maxCount: number
    total: number
    numericTotal: number
    consensus: 'consensus' | 'close' | 'split'
  }

  const props = defineProps<{
    stats: RoundStats | null
    displayVoteCounts?: Record<string, number> | null
    historyEnabled?: boolean
    committedVote?: string | null
    canCommitVote?: boolean
  }>()

  const emit = defineEmits<{
    'commit-vote': [value: string]
  }>()

  const customVoteInput = ref('')
  const expanded = ref(false)

  const consensusClass = computed(() => {
    if (!props.stats) return 'wait'
    return props.stats.consensus
  })

  const consensusLabel = computed(() => {
    if (!props.stats) return 'Waiting'
    if (props.stats.consensus === 'consensus') return 'Consensus'
    if (props.stats.consensus === 'close') return 'Near vote'
    return 'Far vote'
  })

  const hasNumericStats = computed(() => props.stats?.numericTotal != null && props.stats.numericTotal > 0)
  const summaryAverage = computed(() => props.stats && hasNumericStats.value ? formatNum(props.stats.avg) : '-')
  const summaryClosest = computed(() => props.stats && hasNumericStats.value ? String(props.stats.closest ?? '-') : '-')

  const canCommitEstimate = computed(() => props.historyEnabled === true && props.canCommitVote === true)
  const distributionEntries = computed(() =>
    Object.entries(props.displayVoteCounts ?? {}).map(([value, count]) => ({
      count,
      percent: props.stats?.maxCount ? Math.max(8, (count / props.stats.maxCount) * 100) : 0,
      value,
    })),
  )

  const autoSelectedValue = computed<string | null>(() => {
    if (!canCommitEstimate.value || !props.displayVoteCounts || props.committedVote) return null
    if (props.stats?.consensus !== 'consensus') return null
    const keys = Object.keys(props.displayVoteCounts)
    return keys.length === 1 ? keys[0] : null
  })

  const customVoteValue = computed(() => customVoteInput.value.trim())
  const canCommitCustom = computed(() =>
    canCommitEstimate.value && customVoteValue.value.length > 0 && customVoteValue.value !== props.committedVote,
  )

  function formatNum (num: number | null | undefined): string {
    if (num == null) return '-'
    return Number.isInteger(num) ? String(num) : String(Number.parseFloat(num.toFixed(2)))
  }

  function commitValue (value: string) {
    if (!canCommitEstimate.value) return
    emit('commit-vote', value)
  }

  function commitCustom () {
    if (!canCommitCustom.value) return
    emit('commit-vote', customVoteValue.value)
  }
</script>

<template>
  <section
    class="stats"
    :class="{ 'stats-expanded': expanded }"
    :data-state="stats ? 'shown' : 'hidden'"
  >
    <button
      class="stats-summary"
      data-test-id="round-insights-toggle"
      type="button"
      @click="expanded = !expanded"
    >
      <span class="stats-summary-title">Round insights</span>

      <span class="consensus-status" :class="`consensus-${consensusClass}`">
        <span aria-hidden="true" />
        {{ consensusLabel }}
      </span>

      <span class="stats-summary-item">
        Avg <strong>{{ summaryAverage }}</strong>
      </span>

      <span class="stats-summary-item">
        Closest <strong>{{ summaryClosest }}</strong>
      </span>

      <v-icon class="stats-summary-icon" :icon="expanded ? 'mdi-chevron-up' : 'mdi-chevron-down'" size="16" />
    </button>

    <div class="stats-details">
      <div class="stats-details-inner">
        <div class="stats-expanded-row">
          <button
            class="stats-metric stats-metric-action"
            :disabled="!canCommitEstimate || !stats || !hasNumericStats"
            type="button"
            @click="commitValue(formatNum(stats?.avg))"
          >
            <span>Avg</span>

            <strong :class="{ muted: !stats }">
              {{ stats ? formatNum(stats.avg) : '-' }}
            </strong>
          </button>

          <button
            class="stats-metric stats-metric-action"
            :disabled="!canCommitEstimate || !stats || !hasNumericStats"
            type="button"
            @click="commitValue(formatNum(stats?.median))"
          >
            <span>Median</span>

            <strong :class="{ muted: !stats }">
              {{ stats ? formatNum(stats.median) : '-' }}
            </strong>
          </button>

          <button
            class="stats-metric stats-metric-action"
            :disabled="!canCommitEstimate || !stats || stats.closest == null"
            type="button"
            @click="commitValue(String(stats?.closest))"
          >
            <span>Closest</span>

            <strong :class="{ muted: !stats }">
              {{ stats ? stats.closest : '-' }}
            </strong>
          </button>

          <div class="stats-metric">
            <span>Spread</span>

            <strong :class="{ muted: !stats }">
              <template v-if="stats && hasNumericStats">
                {{ stats.min }}<span class="spread-separator">-</span>{{ stats.max }}
              </template>

              <template v-else>-</template>
            </strong>
          </div>
        </div>

        <div v-if="distributionEntries.length > 0" class="distribution">
          <span class="distribution-label">Distribution</span>

          <button
            v-for="entry in distributionEntries"
            :key="entry.value"
            :aria-pressed="entry.value === committedVote || entry.value === autoSelectedValue"
            class="dist-choice"
            :class="{
              selected: entry.value === committedVote || entry.value === autoSelectedValue,
              clickable: canCommitEstimate,
            }"
            :data-card-value="entry.value"
            data-test-id="vote-result-card"
            :disabled="!canCommitEstimate"
            type="button"
            @click="commitValue(entry.value)"
          >
            <span class="dist-choice-value">{{ entry.value }}</span>

            <span class="dist-choice-track">
              <span :style="{ width: `${entry.percent}%` }" />
            </span>

            <span class="dist-choice-count">{{ entry.count }}</span>
          </button>

          <label v-if="canCommitEstimate" class="custom-final-control">
            <span>Custom</span>

            <input
              v-model="customVoteInput"
              data-test-id="vote-custom-final-input"
              maxlength="8"
              placeholder="value"
              type="text"
              @keydown.enter.prevent="commitCustom"
            >

            <button
              data-test-id="vote-custom-final-submit"
              :disabled="!canCommitCustom"
              type="button"
              @click="commitCustom"
            >
              Set
            </button>
          </label>
        </div>
      </div>
    </div>
  </section>
</template>
