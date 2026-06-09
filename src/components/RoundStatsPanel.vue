<script setup lang="ts">
  import type { VoteValue } from '@/types/room'
  import { computed, ref } from 'vue'
  import LabeledSeparator from './LabeledSeparator.vue'

  interface RoundStats {
    avg: number | null
    median: string | number | null
    closest: string | number | null
    min: string | number | null
    max: string | number | null
    spread: number | null
    counts: Record<string, number>
    maxCount: number
    total: number
    numericTotal: number
    ordinalTotal: number
    consensus: 'consensus' | 'close' | 'split'
  }

  const props = defineProps<{
    stats: RoundStats | null
    displayVoteCounts?: Record<string, number> | null
    historyEnabled?: boolean
    committedVote?: string | null
    canCommitVote?: boolean
    voteOptions?: VoteValue[]
    alwaysExpanded?: boolean
  }>()

  const emit = defineEmits<{
    'commit-vote': [value: string]
  }>()

  const customVoteInput = ref('')
  const expanded = ref(false)
  const panelExpanded = computed(() => props.alwaysExpanded === true || expanded.value)

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
  const hasOrdinalStats = computed(() => props.stats?.ordinalTotal != null && props.stats.ordinalTotal > 0)
  const summaryAverage = computed(() => props.stats && hasNumericStats.value ? formatNum(props.stats.avg) : '-')
  const summaryClosest = computed(() => props.stats && hasOrdinalStats.value ? formatVote(props.stats.closest) : '-')

  const canCommitEstimate = computed(() => props.historyEnabled === true && props.canCommitVote === true)
  const distributionEntries = computed(() =>
    sortDistributionEntries(props.displayVoteCounts ?? {}, props.voteOptions ?? [])
      .map(([value, count]) => ({
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

  const selectedCommittedVote = computed(() => props.committedVote ?? autoSelectedValue.value)
  const customVoteValue = computed(() => customVoteInput.value.trim())
  const canCommitCustom = computed(() =>
    canCommitEstimate.value && customVoteValue.value.length > 0 && customVoteValue.value !== props.committedVote,
  )

  function formatNum (num: number | null | undefined): string {
    if (num == null) return '-'
    return Number.isInteger(num) ? String(num) : String(Number.parseFloat(num.toFixed(2)))
  }

  function formatVote (vote: string | number | null | undefined): string {
    if (vote == null) return '-'
    return String(vote)
  }

  function sortDistributionEntries (
    counts: Record<string, number>,
    voteOptions: readonly VoteValue[],
  ): Array<[string, number]> {
    const order = new Map<string, number>()
    for (const [index, value] of voteOptions.entries()) {
      const key = String(value)
      if (!order.has(key)) {
        order.set(key, index)
      }
    }

    return Object.entries(counts).toSorted(([left], [right]) => {
      const leftOrder = order.get(left)
      const rightOrder = order.get(right)
      if (leftOrder != null && rightOrder != null) return leftOrder - rightOrder
      if (leftOrder != null) return -1
      if (rightOrder != null) return 1
      return left.localeCompare(right, undefined, { numeric: true })
    })
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
    :class="{ 'stats-expanded': panelExpanded, 'stats-always-expanded': alwaysExpanded }"
    :data-state="stats ? 'shown' : 'hidden'"
  >
    <button
      class="stats-summary"
      data-test-id="round-insights-toggle"
      type="button"
      @click="alwaysExpanded ? undefined : expanded = !expanded"
    >
      <span class="stats-summary-title">Round insights</span>

      <span class="consensus-status" :class="`consensus-${consensusClass}`">
        <span aria-hidden="true" />
        {{ consensusLabel }}
      </span>

      <span v-if="!panelExpanded" class="stats-summary-item">
        Avg <strong>{{ summaryAverage }}</strong>
      </span>

      <span v-if="!panelExpanded" class="stats-summary-item">
        Closest <strong>{{ summaryClosest }}</strong>
      </span>

      <v-icon v-if="!alwaysExpanded" class="stats-summary-icon" :icon="panelExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down'" size="16" />
    </button>

    <div class="stats-details">
      <div class="stats-details-inner">
        <div class="stats-expanded-row">
          <button
            class="stats-metric stats-metric-action"
            :class="{ selected: selectedCommittedVote === formatNum(stats?.avg) }"
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
            :class="{ selected: selectedCommittedVote === formatVote(stats?.median) }"
            :disabled="!canCommitEstimate || !stats || stats.median == null"
            type="button"
            @click="commitValue(formatVote(stats?.median))"
          >
            <span>Median</span>

            <strong :class="{ muted: !stats }">
              {{ stats ? formatVote(stats.median) : '-' }}
            </strong>
          </button>

          <button
            class="stats-metric stats-metric-action"
            :class="{ selected: selectedCommittedVote === formatVote(stats?.closest) }"
            :disabled="!canCommitEstimate || !stats || stats.closest == null"
            type="button"
            @click="commitValue(formatVote(stats?.closest))"
          >
            <span>Closest</span>

            <strong :class="{ muted: !stats }">
              {{ stats ? formatVote(stats.closest) : '-' }}
            </strong>
          </button>

          <div class="stats-metric">
            <span>Spread</span>

            <strong :class="{ muted: !stats }">
              <template v-if="stats && hasOrdinalStats">
                {{ formatVote(stats.min) }}<span class="spread-separator">-</span>{{ formatVote(stats.max) }}
              </template>

              <template v-else>-</template>
            </strong>
          </div>
        </div>

        <template v-if="distributionEntries.length > 0">
          <LabeledSeparator label="Distribution" />

          <div class="distribution">
            <button
              v-for="entry in distributionEntries"
              :key="entry.value"
              :aria-pressed="entry.value === selectedCommittedVote"
              class="dist-choice"
              :class="{
                selected: entry.value === selectedCommittedVote,
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
          </div>

          <label v-if="canCommitEstimate" class="custom-final-control">
            <span>Custom</span>

            <input
              v-model="customVoteInput"
              data-test-id="vote-custom-final-input"
              maxlength="8"
              placeholder="Vote"
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
        </template>
      </div>
    </div>
  </section>
</template>
