import { type Browser, expect, type Locator, type Page } from '@playwright/test'
import {
  encodeFirebaseConfig,
  stubFirebaseHealthCheck,
  validFirebaseConfig,
  visitConfiguredApp,
} from './appFlows'

export interface CreatedRoom {
  id: string
  name: string
}

export interface JoinedRoomParticipant {
  page: Page
  close: () => Promise<void>
}

export async function createRoomForTest (
  page: Page,
  options: {
    name?: string
    configure?: (page: Page) => Promise<void>
  } = {},
): Promise<CreatedRoom> {
  const roomName = options.name ?? `Workflow room ${Date.now()}`

  await visitConfiguredApp(page)
  await page.goto('/poker0matic/app/create')
  await expect(page.getByRole('heading', { name: 'Create a room' })).toBeVisible()

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const roomNameInput = page.getByTestId('room-name-input').locator('input')
    await roomNameInput.fill(roomName)
    await expect(roomNameInput).toHaveValue(roomName)
    await options.configure?.(page)
    await expect(page.getByTestId('create-room-submit')).toBeEnabled()
    await page.getByTestId('create-room-submit').click()

    try {
      await expect(page.getByTestId('room-shell')).toBeVisible({ timeout: 10_000 })
      break
    } catch (error) {
      if (attempt === 2 || await page.getByRole('heading', { name: 'Create a room' }).count() === 0) {
        throw error
      }
    }
  }

  await expect(page.getByTestId('room-name')).toHaveText(roomName)

  const url = new URL(page.url())
  const pathSegments = url.pathname.split('/').filter(Boolean)
  const id = pathSegments.at(-1)
  if (!id) {
    throw new Error(`Could not read room id from ${url.href}`)
  }

  return { id, name: roomName }
}

export function voteCard (page: Page, value: string): Locator {
  return page.locator(`[data-test-id="vote-card"][data-card-value="${value}"]`)
}

export function resultCard (page: Page, value: string): Locator {
  return page.locator(`[data-test-id="vote-result-card"][data-card-value="${value}"]`)
}

export function tablePlayer (page: Page, name: string): Locator {
  return page.locator(`[data-test-id="room-player"][data-player-name="${name}"]`)
}

export function gridPlayer (page: Page, name: string): Locator {
  return page.locator(`[data-test-id="room-grid-player"][data-player-name="${name}"]`)
}

export async function joinRoomAs (
  browser: Browser,
  room: CreatedRoom,
  name: string,
): Promise<JoinedRoomParticipant> {
  const context = await browser.newContext()
  const page = await context.newPage()

  await page.addInitScript(({ participantName }) => {
    localStorage.setItem('poker_user_id', `e2e-${participantName.toLowerCase()}-${crypto.randomUUID()}`)
    localStorage.setItem('poker_user_name', participantName)
  }, { participantName: name })
  await stubFirebaseHealthCheck(page)
  await page.goto(`/poker0matic/app/room/${room.id}?config=${encodeURIComponent(encodeFirebaseConfig(validFirebaseConfig))}`)

  await expect(page.getByTestId('room-shell')).toBeVisible()
  await expect(page.getByTestId('room-name')).toHaveText(room.name)

  return {
    page,
    close: () => context.close(),
  }
}

export async function seedRoomParticipants (
  page: Page,
  roomId: string,
  participants: Array<{
    name: string
    vote?: string | number
  }>,
) {
  await page.evaluate(async ({ roomId: targetRoomId, participants: seededParticipants }) => {
    const joinedAtBase = Date.now()
    const updates: Record<string, unknown> = {}

    for (const [index, participant] of seededParticipants.entries()) {
      const userId = `seed-user-${index + 1}`
      const userRecord = {
        name: participant.name,
        joinedAt: joinedAtBase + index,
        avatarUrl: null,
        avatarCrop: null,
      }
      updates[`users/${userId}`] = userRecord
      updates[`roundParticipants/${userId}`] = participant.vote === undefined
        ? userRecord
        : {
            ...userRecord,
            vote: participant.vote,
          }
    }

    await fetch(`/__firebase-mock?path=${encodeURIComponent(`rooms/${targetRoomId}`)}`, {
      body: JSON.stringify({
        operation: 'update',
        value: {
          ...updates,
          lastActivity: Date.now(),
        },
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })
  }, { roomId, participants })
}
