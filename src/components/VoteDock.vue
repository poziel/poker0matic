<script setup lang="ts">
  import { computed, ref, watch } from 'vue'

  type VoteValue = number | string

  interface RoundStats {
    avg: number | null
    median: number | null
    closest: number | null
    min: number | null
    max: number | null
    counts: Record<string, number>
    maxCount: number
    total: number
    numericTotal: number
    consensus: 'consensus' | 'close' | 'split'
  }

  const props = defineProps<{
    collapsed: boolean
    selectedVote: VoteValue | null
    userName: string
    voteOptions: readonly VoteValue[]
    showVotes: boolean
    stats: RoundStats | null
    displayVoteCounts: Record<string, number> | null
    historyEnabled: boolean
    committedVote: string | null
    canCommitVote: boolean
    canVote: boolean
    disabledHint?: string
    externalDockActive?: boolean
    externalWindow?: boolean
  }>()

  const emit = defineEmits<{
    'update:collapsed': [value: boolean]
    'cast-vote': [value: VoteValue]
    'commit-vote': [value: string]
    'toggle-external-dock': []
  }>()

  const customVoteInput = ref('')
  const customCardInput = ref<HTMLInputElement | null>(null)

  watch(() => props.showVotes, showing => {
    if (!showing) customVoteInput.value = ''
  })

  const consensusLabel = computed(() => {
    if (!props.stats) return ''
    if (props.stats.consensus === 'consensus') return 'Consensus'
    if (props.stats.consensus === 'close') return 'Near match'
    return 'Split vote'
  })

  const consensusClass = computed(() => {
    if (!props.stats) return 'wait'
    return props.stats.consensus === 'split' ? 'no' : 'yes'
  })

  const maxVoteCount = computed(() => {
    if (!props.displayVoteCounts) return 0
    return Math.max(...Object.values(props.displayVoteCounts))
  })

  const isConsensus = computed(() => props.stats?.consensus === 'consensus')

  const hasNumericStats = computed(() => props.stats?.numericTotal != null && props.stats.numericTotal > 0)

  const autoSelectedValue = computed<string | null>(() => {
    if (!props.historyEnabled || !props.canCommitVote || !isConsensus.value || !props.displayVoteCounts || props.committedVote) return null
    const keys = Object.keys(props.displayVoteCounts)
    return keys.length === 1 ? keys[0] : null
  })

  const collapsedStatsLabel = computed(() => {
    if (!props.stats) return ''
    if (props.stats.avg != null) return `avg ${formatNum(props.stats.avg)}`
    return autoSelectedValue.value ?? consensusLabel.value
  })

  const customVoteValue = computed(() => customVoteInput.value.trim())
  const isCustomCommitted = computed(() =>
    customVoteValue.value.length > 0 && customVoteValue.value === props.committedVote,
  )
  const canCommitCustom = computed(() =>
    props.canCommitVote && customVoteValue.value.length > 0 && customVoteValue.value !== props.committedVote,
  )

  function formatNum (num: number | null | undefined): string {
    if (num == null) return '-'
    return Number.isInteger(num) ? String(num) : String(Number.parseFloat(num.toFixed(2)))
  }

  function commitValue (value: string) {
    if (!props.historyEnabled || !props.canCommitVote) return
    emit('commit-vote', value)
    // Do NOT update customVoteInput — the text box is independent
  }

  function commitCustom () {
    if (!canCommitCustom.value) return
    emit('commit-vote', customVoteValue.value)
  }
</script>

<template>
  <aside
    class="dock"
    :class="{
      'dock-collapsed': collapsed,
      'dock-external-window': externalWindow,
    }"
  >

    <!-- ── Voting state ───────────────────────────────────────────────── -->
    <template v-if="!showVotes && (!collapsed || externalWindow)">
      <div class="dock-cards">
        <button
          v-for="option in voteOptions"
          :key="option"
          class="vote-card p0-card p0-card-value p0-card-interactive"
          :class="{
            selected: selectedVote === option,
            'p0-card-selected': selectedVote === option,
          }"
          :data-card-value="option"
          :disabled="!canVote"
          :title="!canVote ? disabledHint : ''"
          type="button"
          @click="$emit('cast-vote', option)"
        >
          <span class="corner p0-card-corner p0-card-corner-tl tl">{{ option }}</span>
          <span class="p0-card-main">{{ option }}</span>
          <span class="corner p0-card-corner p0-card-corner-br br">{{ option }}</span>
        </button>
      </div>

      <div class="dock-hint">
        <template v-if="canVote">
          Playing as <strong>{{ userName }}</strong> · tap a card to vote
        </template>

        <template v-else>
          {{ disabledHint || 'Voting is temporarily unavailable for this round' }}
        </template>
      </div>
    </template>

    <!-- ── Insights state ────────────────────────────────────────────── -->
    <template v-if="showVotes && (!collapsed || externalWindow)">
      <!-- Header at top -->
      <div class="dock-insights-header">
        <span class="dock-insights-label">Round insights</span>
        <span v-if="stats" class="consensus-pill" :class="consensusClass">{{ consensusLabel }}</span>
        <span class="dock-insights-spacer" />

        <span v-if="committedVote" class="dock-committed-badge">
          <v-icon icon="mdi-check-circle" size="13" />
          {{ committedVote }}
        </span>

        <span v-else-if="historyEnabled && canCommitVote" class="dock-committed-hint">click a card to set final estimate</span>

        <span v-else-if="historyEnabled" class="dock-committed-hint">leader selects the final estimate</span>
      </div>

      <!-- Distribution as cards -->
      <div class="dock-cards dock-cards-insights">
        <template v-if="displayVoteCounts">
          <div
            v-for="(count, value) in displayVoteCounts"
            :key="value"
            class="dist-card-wrap"
          >
            <button
              :aria-pressed="String(value) === committedVote || String(value) === autoSelectedValue"
              class="dist-card p0-card p0-card-value p0-card-compact"
              :class="{
                'dist-mode': count === maxVoteCount,
                'dist-committed': String(value) === committedVote || String(value) === autoSelectedValue,
                'dist-clickable': historyEnabled && canCommitVote,
                'p0-card-interactive': historyEnabled && canCommitVote,
                'p0-card-selected': String(value) === committedVote || String(value) === autoSelectedValue,
              }"
              :data-card-value="value"
              :disabled="!historyEnabled || !canCommitVote"
              type="button"
              @click="commitValue(String(value))"
            >
              <span class="corner p0-card-corner p0-card-corner-tl tl">{{ value }}</span>
              <span class="p0-card-main">{{ value }}</span>
              <span class="corner p0-card-corner p0-card-corner-br br">{{ value }}</span>
            </button>

            <span class="dist-count">× {{ count }}</span>
          </div>

          <!-- Custom estimate card (inline, after a separator dot) -->
          <template v-if="historyEnabled && canCommitVote">
            <span class="dist-custom-sep">·</span>

            <div class="dist-card-wrap">
              <div
                class="dist-card custom-vote-card p0-card p0-card-value p0-card-compact p0-card-interactive"
                :class="{
                  'custom-has-value': customVoteValue.length > 0,
                  'dist-committed': isCustomCommitted,
                  'p0-card-selected': isCustomCommitted,
                }"
                role="button"
                tabindex="0"
                @click="customCardInput?.focus()"
                @keydown.enter.prevent="customCardInput?.focus()"
              >
                <span class="corner p0-card-corner p0-card-corner-tl tl">{{ customVoteInput || '···' }}</span>

                <input
                  ref="customCardInput"
                  v-model="customVoteInput"
                  class="custom-card-input"
                  maxlength="5"
                  placeholder="···"
                  type="text"
                  @keydown.enter.prevent="commitCustom"
                >

                <span class="corner p0-card-corner p0-card-corner-br br">{{ customVoteInput || '···' }}</span>
              </div>

              <button
                v-if="customVoteValue"
                class="dist-count dock-custom-set"
                :disabled="!canCommitCustom"
                type="button"
                @click="commitCustom"
              >
                set ↵
              </button>

              <span v-else class="dist-count" style="color: var(--text-4)">custom</span>
            </div>
          </template>
        </template>

        <div v-else class="dock-no-data">
          No votes to display
        </div>
      </div>

      <!-- Stats line / consensus celebration -->
      <div v-if="isConsensus" class="consensus-celebration">
        <span>✨</span>
        <span class="consensus-celebration-text">Everyone agrees!</span>
        <span>✨</span>
      </div>

      <div v-else class="dock-hint dock-stats-hint">
        <template v-if="stats && hasNumericStats">
          <template v-if="historyEnabled && canCommitVote">
            <button class="dock-stat-btn" @click="commitValue(formatNum(stats.avg))">
              Avg <strong>{{ formatNum(stats.avg) }}</strong>
            </button>

            <span class="dock-hint-sep">·</span>

            <button class="dock-stat-btn" @click="commitValue(formatNum(stats.median))">
              Median <strong>{{ formatNum(stats.median) }}</strong>
            </button>

            <span class="dock-hint-sep">·</span>

            <button class="dock-stat-btn" @click="commitValue(formatNum(stats.closest))">
              Closest <strong>{{ stats.closest }}</strong>
            </button>

            <span class="dock-hint-sep">·</span>
            Spread <strong>{{ stats.min }}–{{ stats.max }}</strong>
          </template>

          <template v-else>
            Avg <strong>{{ formatNum(stats.avg) }}</strong>
            <span class="dock-hint-sep">·</span>
            Median <strong>{{ formatNum(stats.median) }}</strong>
            <span class="dock-hint-sep">·</span>
            Closest <strong>{{ stats.closest }}</strong>
            <span class="dock-hint-sep">·</span>
            Spread <strong>{{ stats.min }}–{{ stats.max }}</strong>
          </template>
        </template>

        <template v-else>
          No numeric votes this round
        </template>
      </div>

    </template>

    <!-- ── Toggle (always at bottom) ─────────────────────────────────── -->
    <div v-if="!externalWindow" class="dock-toggle">
      <button
        class="dock-toggle-main"
        type="button"
        @click="$emit('update:collapsed', !collapsed)"
      >
        <template v-if="collapsed">
          <span v-if="showVotes && committedVote" class="dock-mini-vote">{{ committedVote }}</span>
          <span v-else-if="showVotes && stats" class="dock-mini-vote">{{ collapsedStatsLabel }}</span>
          <span v-else-if="selectedVote != null" class="dock-mini-vote">{{ selectedVote }}</span>
        </template>

        <span class="dock-toggle-label">
          <template v-if="collapsed">
            {{ showVotes ? 'Expand insights' : (selectedVote != null ? 'Your vote · expand deck' : 'Expand deck') }}
          </template>

          <template v-else>
            {{ showVotes ? 'Collapse insights' : 'Collapse deck' }}
          </template>
        </span>

        <v-icon :icon="collapsed ? 'mdi-chevron-up' : 'mdi-chevron-down'" size="16" />
      </button>

      <button
        :aria-label="externalDockActive ? 'Bring voting dock back' : 'Open voting dock in a window'"
        class="dock-external-btn"
        :title="externalDockActive ? 'Bring voting dock back' : 'Open voting dock in a window'"
        type="button"
        @click.stop="$emit('toggle-external-dock')"
      >
        <v-icon :icon="externalDockActive ? 'mdi-monitor-off' : 'mdi-open-in-new'" size="14" />
      </button>
    </div>
  </aside>
</template>
