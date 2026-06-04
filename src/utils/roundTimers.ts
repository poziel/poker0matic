import type { RoomRecord, RoundTimerState } from '@/types/room'

export type RoundTimerMode = 'automatic' | 'manual'

export interface RoundTimerConfig {
  enabled: boolean
  mode: RoundTimerMode
  durationSeconds: number
}

export interface RoundTimerStrategy {
  buildInitialState: (roundNumber: number, now: number) => RoundTimerState
  beginRound: (roundNumber: number, now: number) => RoundTimerState
  startManual?: (roundNumber: number, now: number) => RoundTimerState
}

export const DEFAULT_TIMER_DURATION_SECONDS = 300

export function normalizeTimerDurationSeconds (value: unknown): number {
  const parsed = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_TIMER_DURATION_SECONDS
  }
  return Math.ceil(parsed)
}

export function getRoomTimerConfig (room: Pick<RoomRecord, 'settings'> | null | undefined): RoundTimerConfig {
  const settings = room?.settings
  return {
    enabled: settings?.timerEnabled === true,
    mode: settings?.timerMode === 'manual' ? 'manual' : 'automatic',
    durationSeconds: normalizeTimerDurationSeconds(settings?.timerDurationSeconds),
  }
}

export function createRoundTimerStrategy (config: RoundTimerConfig): RoundTimerStrategy {
  const durationMs = config.durationSeconds * 1000

  if (config.mode === 'manual') {
    return {
      buildInitialState: roundNumber => buildIdleTimer('manual', durationMs, roundNumber),
      beginRound: roundNumber => buildIdleTimer('manual', durationMs, roundNumber),
      startManual: (roundNumber, now) => buildRunningTimer('manual', durationMs, roundNumber, now),
    }
  }

  return {
    buildInitialState: (roundNumber, now) => buildRunningTimer('automatic', durationMs, roundNumber, now),
    beginRound: (roundNumber, now) => buildRunningTimer('automatic', durationMs, roundNumber, now),
  }
}

export function buildTimerForRound (
  room: Pick<RoomRecord, 'settings'> | null | undefined,
  roundNumber: number,
  now: number,
): RoundTimerState | null {
  const config = getRoomTimerConfig(room)
  if (!config.enabled) {
    return null
  }
  return createRoundTimerStrategy(config).beginRound(roundNumber, now)
}

export function buildInitialTimerForRoom (
  settings: Pick<NonNullable<RoomRecord['settings']>, 'timerEnabled' | 'timerMode' | 'timerDurationSeconds'>,
  roundNumber: number,
  now: number,
): RoundTimerState | null {
  const config = getRoomTimerConfig({ settings })
  if (!config.enabled) {
    return null
  }
  return createRoundTimerStrategy(config).buildInitialState(roundNumber, now)
}

export function finishRoundTimer (timer: RoundTimerState | null | undefined, roundNumber: number): RoundTimerState | null {
  if (!timer) {
    return null
  }
  return {
    ...timer,
    status: 'finished',
    roundNumber,
    endsAt: timer.endsAt ?? null,
  }
}

export function isTimerRunningForRound (
  timer: RoundTimerState | null | undefined,
  roundNumber: number,
): timer is RoundTimerState & { status: 'running', endsAt: number } {
  return !!timer
    && timer.status === 'running'
    && timer.roundNumber === roundNumber
    && typeof timer.endsAt === 'number'
}

function buildIdleTimer (mode: RoundTimerMode, durationMs: number, roundNumber: number): RoundTimerState {
  return {
    status: 'idle',
    mode,
    durationMs,
    roundNumber,
    startedAt: null,
    endsAt: null,
  }
}

function buildRunningTimer (
  mode: RoundTimerMode,
  durationMs: number,
  roundNumber: number,
  now: number,
): RoundTimerState {
  return {
    status: 'running',
    mode,
    durationMs,
    roundNumber,
    startedAt: now,
    endsAt: now + durationMs,
  }
}
