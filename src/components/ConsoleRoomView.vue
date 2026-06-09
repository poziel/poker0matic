<script setup lang="ts">
  import type { RoomConsoleLogEntry, VoteValue } from '@/types/room'
  import { nextTick, ref, watch } from 'vue'

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
  const timeFormatter = new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
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
    return timeFormatter.format(new Date(createdAt))
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

  function formatVoteLiteral (vote: VoteValue | null | undefined) {
    if (vote == null) return 'null'
    return JSON.stringify(String(vote))
  }

  function formatNameLiteral (name: string) {
    return JSON.stringify(name)
  }

  function formatVoteComment (vote: VoteValue | null | undefined) {
    if (vote == null) return 'did not vote'
    if (vote === '?') return 'I don\'t know.'
    if (vote === '☕') return 'It\'s break time.'
    return 'Voted.'
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

    <div class="console-room-body" :class="{ 'console-room-body-with-votes': showVotes }">
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
          <span class="console-room-vote-panel-title">revealedvote.ts</span>
        </div>

        <div class="console-room-vote-list" data-test-id="room-console-vote-object">
          <p class="console-room-vote-object-line">
            <span class="console-room-vote-keyword">const</span>
            <span class="console-room-vote-variable">votes</span>
            <span class="console-room-vote-operator">:</span>
            <span class="console-room-vote-type">Record&lt;string, string | null&gt;</span>
            <span class="console-room-vote-operator">=</span>
            <span class="console-room-vote-brace">{</span>
          </p>

          <p
            v-for="player in players"
            :key="player.userId"
            class="console-room-vote-row"
            :class="{ 'console-room-vote-row-missed': player.vote == null }"
            :data-player-name="player.name"
            :data-result-state="player.vote == null ? 'missed' : 'voted'"
            data-test-id="room-console-vote-row"
          >
            <span aria-hidden="true" class="console-room-vote-indent" />
            <span class="console-room-vote-name">{{ formatNameLiteral(player.name) }}</span>
            <span class="console-room-vote-operator">:</span>
            <span class="console-room-vote-value">{{ formatVoteLiteral(player.vote) }}</span>
            <span class="console-room-vote-operator console-room-vote-coma">,</span>

            <span class="console-room-vote-comment">
              // {{ formatVoteComment(player.vote) }}
            </span>
          </p>

          <p class="console-room-vote-object-line">
            <span class="console-room-vote-brace">}</span>
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
