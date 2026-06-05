import { describe, expect, it } from 'vitest'
import {
  buildInitialTimerForRoom,
  buildTimerForRound,
  createRoundTimerStrategy,
  DEFAULT_TIMER_DURATION_SECONDS,
  DEFAULT_TIMER_WARNING_PERCENTAGE,
  DEFAULT_TIMER_WARNING_SECONDS,
  finishRoundTimer,
  getRoomTimerConfig,
  getTimerWarningThresholdMs,
  normalizeTimerDurationSeconds,
  normalizeTimerWarningValue,
  pauseRoundTimer,
  restartRoundTimer,
  resumeRoundTimer,
} from '@/utils/roundTimers'

describe('Feature: round timer configuration', () => {
  it('Scenario: invalid durations and warning values fall back to defaults', () => {
    expect(normalizeTimerDurationSeconds('')).toBe(DEFAULT_TIMER_DURATION_SECONDS)
    expect(normalizeTimerDurationSeconds(-1)).toBe(DEFAULT_TIMER_DURATION_SECONDS)
    expect(normalizeTimerWarningValue(null, 'seconds')).toBe(DEFAULT_TIMER_WARNING_SECONDS)
    expect(normalizeTimerWarningValue(undefined, 'percentage')).toBe(DEFAULT_TIMER_WARNING_PERCENTAGE)
  })

  it('Scenario: room timer settings are normalized for automatic timers', () => {
    const config = getRoomTimerConfig({
      settings: {
        timerEnabled: true,
        timerMode: 'automatic',
        timerDurationSeconds: 90.2,
        timerAutoRevealEnabled: false,
        timerWarningEnabled: true,
        timerWarningType: 'percentage',
        timerWarningValue: 150,
      },
    })

    expect(config).toEqual({
      enabled: true,
      mode: 'automatic',
      durationSeconds: 91,
      autoRevealEnabled: false,
      warningEnabled: true,
      warningType: 'percentage',
      warningValue: 100,
    })
    expect(getTimerWarningThresholdMs(config)).toBe(91_000)
  })

  it('Scenario: disabled timer settings produce no round timer state', () => {
    expect(buildTimerForRound({ settings: { timerEnabled: false } }, 3, 1000)).toBeNull()
    expect(buildInitialTimerForRoom({ timerEnabled: false }, 3, 1000)).toBeNull()
  })
})

describe('Feature: round timer lifecycle', () => {
  it('Scenario: automatic timers start running at the beginning of each round', () => {
    const timer = buildTimerForRound({
      settings: {
        timerEnabled: true,
        timerMode: 'automatic',
        timerDurationSeconds: 60,
      },
    }, 2, 1000)

    expect(timer).toEqual({
      status: 'running',
      mode: 'automatic',
      durationMs: 60_000,
      roundNumber: 2,
      startedAt: 1000,
      endsAt: 61_000,
      remainingMs: 60_000,
      finishedBy: null,
    })
  })

  it('Scenario: manual timers stay idle until they are explicitly started', () => {
    const strategy = createRoundTimerStrategy({
      enabled: true,
      mode: 'manual',
      durationSeconds: 45,
      autoRevealEnabled: true,
      warningEnabled: false,
      warningType: 'seconds',
      warningValue: 10,
    })

    expect(strategy.buildInitialState(1, 500)).toMatchObject({
      status: 'idle',
      mode: 'manual',
      remainingMs: 45_000,
    })
    expect(strategy.startManual?.(1, 500)).toMatchObject({
      status: 'running',
      startedAt: 500,
      endsAt: 45_500,
    })
  })

  it('Scenario: running timers can be paused, resumed, restarted, and finished', () => {
    const timer = buildTimerForRound({
      settings: {
        timerEnabled: true,
        timerDurationSeconds: 30,
      },
    }, 1, 1000)

    expect(timer).not.toBeNull()

    const paused = pauseRoundTimer(timer!, 16_000)
    expect(paused).toMatchObject({
      status: 'paused',
      remainingMs: 15_000,
      startedAt: null,
      endsAt: null,
    })

    const resumed = resumeRoundTimer(paused, 20_000)
    expect(resumed).toMatchObject({
      status: 'running',
      startedAt: 20_000,
      endsAt: 35_000,
      remainingMs: 15_000,
    })

    const restarted = restartRoundTimer(resumed, 40_000)
    expect(restarted).toMatchObject({
      status: 'running',
      startedAt: 40_000,
      endsAt: 70_000,
      remainingMs: 30_000,
    })

    expect(finishRoundTimer(restarted, 1, 'revealed')).toMatchObject({
      status: 'finished',
      roundNumber: 1,
      remainingMs: 0,
      finishedBy: 'revealed',
    })
  })
})
