<script setup lang="ts">
  type VoteValue = number | string

  defineProps<{
    collapsed: boolean
    selectedVote: VoteValue | null
    userName: string
    voteOptions: readonly VoteValue[]
    showVotes: boolean
    committedVote?: string | null
    canVote: boolean
    disabledHint?: string
    externalDockActive?: boolean
    externalWindow?: boolean
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

    <template v-if="(!showVotes || canVote) && (!collapsed || externalWindow)">
      <div v-if="showVotes" class="dock-change-vote-head">
        <span>Change your vote</span>
        <strong v-if="selectedVote != null">{{ selectedVote }}</strong>
      </div>

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
          data-test-id="vote-card"
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
        <template v-if="canVote && !showVotes">
          Playing as <strong>{{ userName }}</strong> · tap a card to vote
        </template>

        <template v-else-if="canVote">
          Vote changes update the revealed results immediately
        </template>

        <template v-else>
          {{ disabledHint || 'Voting is temporarily unavailable for this round' }}
        </template>
      </div>
    </template>

    <div v-else-if="showVotes && !collapsed" class="dock-hint dock-locked-hint">
      {{ disabledHint || 'Voting is locked after reveal for this room' }}
    </div>

    <!-- ── Toggle (always at bottom) ─────────────────────────────────── -->
    <div v-if="!externalWindow" class="dock-toggle">
      <button
        class="dock-toggle-main"
        data-test-id="vote-dock-toggle"
        type="button"
        @click="$emit('update:collapsed', !collapsed)"
      >
        <template v-if="collapsed">
          <span v-if="showVotes && committedVote" class="dock-mini-vote">{{ committedVote }}</span>
          <span v-else-if="selectedVote != null" class="dock-mini-vote">{{ selectedVote }}</span>
        </template>

        <span class="dock-toggle-label">
          <template v-if="collapsed">
            {{ selectedVote != null ? 'Your vote · expand deck' : (showVotes ? 'Expand vote deck' : 'Expand deck') }}
          </template>

          <template v-else>
            {{ showVotes ? 'Collapse vote deck' : 'Collapse deck' }}
          </template>
        </span>

        <v-icon :icon="collapsed ? 'mdi-chevron-up' : 'mdi-chevron-down'" size="16" />
      </button>

      <button
        aria-label="Open voting dock on phone"
        class="dock-phone-btn"
        data-test-id="vote-dock-phone"
        title="Open voting dock on phone"
        type="button"
        @click.stop="$emit('open-phone-dock')"
      >
        <v-icon icon="mdi-qrcode" size="14" />
      </button>

      <button
        :aria-label="externalDockActive ? 'Bring voting dock back' : 'Open voting dock in a window'"
        class="dock-external-btn"
        data-test-id="vote-dock-external"
        :title="externalDockActive ? 'Bring voting dock back' : 'Open voting dock in a window'"
        type="button"
        @click.stop="$emit('toggle-external-dock')"
      >
        <v-icon :icon="externalDockActive ? 'mdi-monitor-off' : 'mdi-open-in-new'" size="14" />
      </button>
    </div>
  </aside>
</template>
