<script setup lang="ts">
  import type { RoomConsoleLogEntry, VoteValue } from '@/types/room'
  import { computed, nextTick, ref, watch } from 'vue'

  interface ConsoleRoomPlayer {
    userId: string
    name: string
    joinedAt: number
    vote?: VoteValue
    isConnected?: boolean
  }

  const props = defineProps<{
    entries: RoomConsoleLogEntry[]
    players: ConsoleRoomPlayer[]
    roundLabel: string
    showVotes: boolean
    votedCount: number
    totalPlayers: number
  }>()
  const feedElement = ref<HTMLElement | null>(null)
  const latestVoteTrace = computed(() =>
    props.entries
      .toReversed()
      .find(entry => entry.level === 'trace' && /\bvote\b/i.test(entry.message)) ?? null,
  )

  watch(
    () => props.entries.map(entry => entry.id).join('|'),
    async () => {
      await nextTick()
      if (!feedElement.value) return
      feedElement.value.scrollTop = feedElement.value.scrollHeight
    },
    { immediate: true },
  )

  function formatTime (createdAt: number) {
    return new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date(createdAt))
  }

  function formatPrompt (entry: RoomConsoleLogEntry) {
    if (entry.level === 'result' && entry.vote == null) return 'miss'
    if (entry.level === 'trace') return 'trace'
    if (entry.level === 'result') return 'vote'
    if (entry.level === 'system') return 'sys'
    return 'info'
  }

  function getEntryClasses (entry: RoomConsoleLogEntry) {
    return [
      `console-room-line-${entry.level}`,
      {
        'console-room-line-missed': entry.level === 'result' && entry.vote == null,
      },
    ]
  }

  function formatVote (vote: VoteValue | null | undefined) {
    return vote == null ? '-' : String(vote)
  }
</script>

<template>
  <section class="console-room-view" data-test-id="room-console-view">
    <div class="console-room-titlebar">
      <span class="console-room-dot console-room-dot-danger" />
      <span class="console-room-dot console-room-dot-warn" />
      <span class="console-room-dot console-room-dot-ok" />
      <span class="console-room-title">refinimo console</span>
      <span class="console-room-context">{{ roundLabel }} · {{ votedCount }}/{{ totalPlayers }} voted</span>
    </div>

    <div class="console-room-body">
      <div ref="feedElement" aria-live="polite" class="console-room-feed p0-scrollbar" role="log">
        <p
          v-for="entry in entries"
          :key="entry.id"
          class="console-room-line"
          :class="getEntryClasses(entry)"
          :data-log-level="entry.level"
          :data-result-state="entry.level === 'result' ? (entry.vote == null ? 'missed' : 'voted') : undefined"
          data-test-id="room-console-line"
        >
          <span class="console-room-time">{{ formatTime(entry.createdAt) }}</span>
          <span class="console-room-prompt">[{{ formatPrompt(entry) }}]</span>
          <span v-if="entry.level === 'result'" class="console-room-vote">[ {{ entry.vote ?? '-' }} ]</span>
          <span class="console-room-message">{{ entry.message }}</span>
        </p>

        <p v-if="entries.length === 0" class="console-room-line console-room-line-info" data-test-id="room-console-line">
          <span class="console-room-time">--:--:--</span>
          <span class="console-room-prompt">[info]</span>
          <span class="console-room-message">Waiting for room activity.</span>
        </p>
      </div>

      <aside v-if="showVotes" class="console-room-vote-panel" data-test-id="room-console-vote-panel">
        <div class="console-room-vote-panel-head">
          <span>revealed_votes.ts</span>
          <strong>{{ votedCount }}/{{ totalPlayers }}</strong>
        </div>

        <p v-if="latestVoteTrace" class="console-room-vote-trace" data-test-id="room-console-vote-trace">
          {{ latestVoteTrace.message }}
        </p>

        <div class="console-room-vote-list">
          <p
            v-for="player in players"
            :key="player.userId"
            class="console-room-vote-row"
            :class="{ 'console-room-vote-row-missed': player.vote == null }"
            :data-player-name="player.name"
            :data-result-state="player.vote == null ? 'missed' : 'voted'"
            data-test-id="room-console-vote-row"
          >
            <span class="console-room-vote-name">{{ player.name }}</span>
            <span class="console-room-vote-equals">=</span>
            <span class="console-room-vote-value">{{ formatVote(player.vote) }}</span>

            <span class="console-room-vote-comment">
              {{ player.vote == null ? 'did not vote' : 'voted' }}
            </span>
          </p>
        </div>
      </aside>
    </div>

    <div aria-hidden="true" class="console-room-input">
      <span class="console-room-input-user">room</span>
      <span class="console-room-input-path">~/planning</span>
      <span class="console-room-input-symbol">$</span>
      <span class="console-room-input-command">tail -f activity.log</span>
      <span class="console-room-caret" />
    </div>
  </section>
</template>
