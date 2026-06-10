<script setup lang="ts">
  import PlanningCard from './PlanningCard.vue'

  type VoteValue = number | string

  defineProps<{
    collapsed: boolean
    selectedVote: VoteValue | null
    userName: string
    voteOptions: readonly VoteValue[]
    showVotes: boolean
    canVote: boolean
    disabledHint?: string
    externalDockActive?: boolean
    externalWindow?: boolean
    phoneDockActive?: boolean
    showHint?: boolean
  }>()

  defineEmits<{
    'update:collapsed': [value: boolean]
    'cast-vote': [value: VoteValue]
    'open-phone-dock': []
    'toggle-external-dock': []
  }>()
</script>

<template>
  <aside
    class="dock"
    :class="{
      'dock-collapsed': collapsed,
      'dock-external-window': externalWindow,
    }"
  >
    <template v-if="!collapsed || externalWindow">
      <div class="dock-cards">
        <PlanningCard
          v-for="option in voteOptions"
          :key="option"
          class="vote-card"
          :class="{ selected: selectedVote === option }"
          data-test-id="vote-card"
          :disabled="!canVote"
          flipped
          selectable
          :selected="selectedVote === option"
          :title="!canVote ? disabledHint : ''"
          :value="option"
          @select="$emit('cast-vote', $event)"
        />
      </div>

      <div v-if="showHint !== false" class="dock-hint">
        <template v-if="canVote">
          Playing as <strong>{{ userName }}</strong> · tap a card to vote
        </template>

        <template v-else>
          Playing as <strong>{{ userName }}</strong> · deck is read-only for this round
        </template>
      </div>
    </template>

    <!-- ── Toggle (always at bottom) ─────────────────────────────────── -->
    <div v-if="!externalWindow" class="dock-toggle">
      <button
        class="dock-toggle-main"
        data-test-id="vote-dock-toggle"
        type="button"
        @click="$emit('update:collapsed', !collapsed)"
      >
        <template v-if="collapsed">
          <span v-if="selectedVote != null" class="dock-mini-vote">{{ selectedVote }}</span>
        </template>

        <span class="dock-toggle-label">
          <template v-if="collapsed">
            Expand deck
          </template>

          <template v-else>
            Collapse deck
          </template>
        </span>

        <v-icon :icon="collapsed ? 'mdi-chevron-up' : 'mdi-chevron-down'" size="16" />
      </button>

      <button
        :aria-label="phoneDockActive ? 'Disconnect phone voting dock' : 'Open voting dock on phone'"
        class="dock-phone-btn"
        :class="{ active: phoneDockActive }"
        data-test-id="vote-dock-phone"
        :title="phoneDockActive ? 'Disconnect phone voting dock' : 'Open voting dock on phone'"
        type="button"
        @click.stop="$emit('open-phone-dock')"
      >
        <v-icon :icon="phoneDockActive ? 'mdi-cellphone-off' : 'mdi-qrcode'" size="14" />
      </button>

      <button
        :aria-label="externalDockActive ? 'Close voting dock window' : 'Open voting dock in a window'"
        class="dock-external-btn"
        :class="{ active: externalDockActive }"
        data-test-id="vote-dock-external"
        :title="externalDockActive ? 'Close voting dock window' : 'Open voting dock in a window'"
        type="button"
        @click.stop="$emit('toggle-external-dock')"
      >
        <v-icon :icon="externalDockActive ? 'mdi-monitor-off' : 'mdi-open-in-new'" size="14" />
      </button>
    </div>
  </aside>
</template>
