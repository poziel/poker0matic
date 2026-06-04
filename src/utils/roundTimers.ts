import type { RoomRecord, RoundTimerState } from '@/types/room'

export type RoundTimerMode = 'automatic' | 'manual'

export interface RoundTimerConfig {
  enabled: boolean
  mode: RoundTimerMode
  durationSeconds: number
  warningEnabled: boolean
  warningType: 'seconds' | 'percentage'
  warningValue: number
}

export interface RoundTimerStrategy {
  buildInitialState: (roundNumber: number, now: number) => RoundTimerState
  beginRound: (roundNumber: number, now: number) => RoundTimerState
  startManual?: (roundNumber: number, now: number) => RoundTimerState
}

export const DEFAULT_TIMER_DURATION_SECONDS = 300
export const DEFAULT_TIMER_WARNING_SECONDS = 30
export const DEFAULT_TIMER_WARNING_PERCENTAGE = 20

export function normalizeTimerDurationSeconds (value: unknown): number {
  const parsed = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_TIMER_DURATION_SECONDS
  }
  return Math.ceil(parsed)
}

export function getRoomTimerConfig (room: Pick<RoomRecord, 'settings'> | null | undefined): RoundTimerConfig {
  const settings = room?.settings
  const warningType = settings?.timerWarningType === 'percentage' ? 'percentage' : 'seconds'
  return {
    enabled: settings?.timerEnabled === true,
    mode: settings?.timerMode === 'manual' ? 'manual' : 'automatic',
    durationSeconds: normalizeTimerDurationSeconds(settings?.timerDurationSeconds),
    warningEnabled: settings?.timerWarningEnabled === true,
    warningType,
    warningValue: normalizeTimerWarningValue(settings?.timerWarningValue, warningType),
  }
}

export function normalizeTimerWarningValue (value: unknown, type: 'seconds' | 'percentage'): number {
  const parsed = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return type === 'percentage' ? DEFAULT_TIMER_WARNING_PERCENTAGE : DEFAULT_TIMER_WARNING_SECONDS
  }
  if (type === 'percentage') {
    return Math.min(100, Math.ceil(parsed))
  }
  return Math.ceil(parsed)
}

export function getTimerWarningThresholdMs (config: RoundTimerConfig): number | null {
  if (!config.warningEnabled) {
    return null
  }
  if (config.warningType === 'percentage') {
    return Math.ceil(config.durationSeconds * 1000 * (config.warningValue / 100))
  }
  return config.warningValue * 1000
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

export function finishRoundTimer (
  timer: RoundTimerState | null | undefined,
  roundNumber: number,
  finishedBy: 'expired' | 'revealed',
): RoundTimerState | null {
  if (!timer) {
    return null
  }
  return {
    ...timer,
    status: 'finished',
    roundNumber,
    endsAt: timer.endsAt ?? null,
    remainingMs: 0,
    finishedBy,
  }
}

export function pauseRoundTimer (timer: RoundTimerState, now: number): RoundTimerState {
  const remainingMs = isTimerRunningForRound(timer, timer.roundNumber)
    ? Math.max(0, timer.endsAt - now)
    : Math.max(0, timer.remainingMs ?? timer.durationMs)

  return {
    ...timer,
    status: 'paused',
    startedAt: null,
    endsAt: null,
    remainingMs,
    finishedBy: null,
  }
}

export function resumeRoundTimer (timer: RoundTimerState, now: number): RoundTimerState {
  const remainingMs = Math.max(0, timer.remainingMs ?? timer.durationMs)
  return {
    ...timer,
    status: 'running',
    startedAt: now,
    endsAt: now + remainingMs,
    remainingMs,
    finishedBy: null,
  }
}

export function restartRoundTimer (timer: RoundTimerState, now: number): RoundTimerState {
  return {
    ...timer,
    status: 'running',
    startedAt: now,
    endsAt: now + timer.durationMs,
    remainingMs: timer.durationMs,
    finishedBy: null,
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
    remainingMs: durationMs,
    finishedBy: null,
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
    remainingMs: durationMs,
    finishedBy: null,
  }
}
