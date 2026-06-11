export interface ShortcutKeyMatcher {
  key?: string
  code?: string
  ctrlKey?: boolean
  metaKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
}

export interface KeyboardShortcutDefinition {
  id: string
  group: string
  description: string
  keys: ShortcutKeyMatcher[]
  handler: (event: KeyboardEvent) => void
  when?: () => boolean
  allowInEditable?: boolean
  allowRepeat?: boolean
  preventDefault?: boolean
  stopPropagation?: boolean
}

export interface ShortcutHelpEntry {
  keys: string
  description: string
  note?: string
}

interface ShortcutRegistration {
  id: number
  shortcuts: KeyboardShortcutDefinition[]
}

const registrations: ShortcutRegistration[] = []
let nextRegistrationId = 1
let listenerAttached = false

export const APP_SHORTCUT_HELP: ShortcutHelpEntry[] = [
  {
    keys: 'Ctrl/Cmd + ,',
    description: 'Open Preferences',
  },
  {
    keys: 'F1',
    description: 'Open keyboard shortcuts',
  },
  {
    keys: 'Esc',
    description: 'Go back to the lobby',
  },
  {
    keys: 'Ctrl/Cmd + .',
    description: 'Open Firebase configuration',
  },
  {
    keys: 'Ctrl/Cmd + Alt/Option + N',
    description: 'Create a new room',
    note: 'Uses a browser-safe combo because Ctrl/Cmd + N is reserved by browsers for a new window.',
  },
]

export const ROOM_SHORTCUT_HELP: ShortcutHelpEntry[] = [
  {
    keys: '1-0',
    description: 'Select a visible vote card or visible final estimate',
    note: 'Works only while the vote dock is expanded and you are not typing.',
  },
  {
    keys: '-',
    description: 'Cycle through special cards',
  },
  {
    keys: '^',
    description: 'Cycle left through card choices',
  },
  {
    keys: '¸',
    description: 'Cycle right through card choices',
  },
  {
    keys: 'Space',
    description: 'Collapse or expand the vote dock',
  },
  {
    keys: 'Ctrl/Cmd + Space',
    description: 'Open or close the external voting window',
  },
  {
    keys: 'V',
    description: 'Reveal or hide votes',
  },
  {
    keys: 'N',
    description: 'Start the next round',
    note: 'Available after votes are revealed.',
  },
  {
    keys: 'B',
    description: 'Reset the current round',
    note: 'Available while the round is ongoing.',
  },
  {
    keys: 'P',
    description: 'Open or close the room side panel',
  },
  {
    keys: 'Esc',
    description: 'Go back to the lobby',
  },
  {
    keys: 'C',
    description: 'Start or pause the timer',
    note: 'Available when the timer controls are visible.',
  },
  {
    keys: 'X',
    description: 'Add 10 seconds to the timer',
  },
  {
    keys: 'Z',
    description: 'Restart the timer',
  },
  {
    keys: 'Ctrl/Cmd + É',
    description: 'Open room settings',
  },
  {
    keys: 'Ctrl/Cmd + 1-6',
    description: 'Send one of the configured reactions',
  },
]

function matchesShortcut (event: KeyboardEvent, matcher: ShortcutKeyMatcher): boolean {
  if (matcher.key !== undefined && event.key !== matcher.key) {
    return false
  }
  if (matcher.code !== undefined && event.code !== matcher.code) {
    return false
  }
  if ((matcher.ctrlKey ?? false) !== event.ctrlKey) {
    return false
  }
  if ((matcher.metaKey ?? false) !== event.metaKey) {
    return false
  }
  if ((matcher.shiftKey ?? false) !== event.shiftKey) {
    return false
  }
  if ((matcher.altKey ?? false) !== event.altKey) {
    return false
  }

  return true
}

function onKeydown (event: KeyboardEvent) {
  const target = event.target as EventTarget | null

  for (let index = registrations.length - 1; index >= 0; index -= 1) {
    const registration = registrations[index]
    for (const shortcut of registration.shortcuts) {
      if (shortcut.when && !shortcut.when()) {
        continue
      }
      if (event.repeat && !shortcut.allowRepeat) {
        continue
      }
      if (!shortcut.allowInEditable && isEditableEventTarget(target)) {
        continue
      }
      if (!shortcut.keys.some(matcher => matchesShortcut(event, matcher))) {
        continue
      }

      if (shortcut.preventDefault !== false) {
        event.preventDefault()
      }
      if (shortcut.stopPropagation) {
        event.stopPropagation()
      }
      shortcut.handler(event)
      return
    }
  }
}

function attachListener () {
  if (listenerAttached || typeof window === 'undefined') {
    return
  }

  window.addEventListener('keydown', onKeydown)
  listenerAttached = true
}

function detachListener () {
  if (!listenerAttached || registrations.length > 0 || typeof window === 'undefined') {
    return
  }

  window.removeEventListener('keydown', onKeydown)
  listenerAttached = false
}

export function registerKeyboardShortcuts (shortcuts: KeyboardShortcutDefinition[]) {
  const id = nextRegistrationId
  nextRegistrationId += 1
  registrations.push({ id, shortcuts })
  attachListener()

  return () => {
    const registrationIndex = registrations.findIndex(registration => registration.id === id)
    if (registrationIndex !== -1) {
      registrations.splice(registrationIndex, 1)
    }

    detachListener()
  }
}

export function isEditableEventTarget (target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false
  }
  if (target.isContentEditable) {
    return true
  }

  const editableParent = target.closest('[contenteditable="true"]')
  if (editableParent) {
    return true
  }

  const tagName = target.tagName
  return tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT'
}

export function hasActiveOverlay (): boolean {
  if (typeof document === 'undefined') {
    return false
  }

  return document.querySelector('.v-overlay--active') !== null
}
