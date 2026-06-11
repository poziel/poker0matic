import { afterEach, describe, expect, it, vi } from 'vitest'
import { hasActiveOverlay } from '@/utils/keyboardShortcuts'

function overlayStub (classes: string[], hasSnackbarWrapper = false) {
  return {
    classList: {
      contains: (className: string) => classes.includes(className),
    },
    querySelector: (selector: string) => (
      selector === '.v-snackbar__wrapper' && hasSnackbarWrapper ? {} : null
    ),
  } as HTMLElement
}

function stubActiveOverlays (overlays: HTMLElement[]) {
  vi.stubGlobal('document', {
    querySelectorAll: (selector: string) => (
      selector === '.v-overlay--active' ? overlays : []
    ),
  })
}

describe('Feature: keyboard shortcut overlay guard', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('Scenario: snackbar notifications do not block shortcuts', () => {
    stubActiveOverlays([overlayStub(['v-overlay--active', 'v-snackbar'])])

    expect(hasActiveOverlay()).toBe(false)
  })

  it('Scenario: snackbar wrappers do not block shortcuts', () => {
    stubActiveOverlays([overlayStub(['v-overlay--active'], true)])

    expect(hasActiveOverlay()).toBe(false)
  })

  it('Scenario: active modal overlays still block shortcuts', () => {
    stubActiveOverlays([overlayStub(['v-overlay--active'])])

    expect(hasActiveOverlay()).toBe(true)
  })
})
