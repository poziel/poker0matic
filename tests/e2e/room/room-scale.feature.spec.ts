import { expect, test } from '@playwright/test'
import { createRoomForTest, gridPlayer, joinRoomAs, resultCard, seedRoomParticipants, setRoomDisplayMode, tablePlayer, voteCard } from '../support/roomFlows'

test.describe('Feature: room scale', () => {
  test('Scenario: a room remains usable with more than forty participants', async ({ page }) => {
    const room = await createRoomForTest(page, { name: 'Scale planning' })
    const seededParticipants = Array.from({ length: 45 }, (_, index) => ({
      name: `Planner ${String(index + 1).padStart(2, '0')}`,
      vote: index < 30 ? [1, 2, 3, 5, 8][index % 5] : undefined,
    }))

    await seedRoomParticipants(page, room.id, seededParticipants)

    await expect(page.getByTestId('room-vote-count')).toHaveText('30/46 voted')
    await expect(page.getByTestId('room-player')).toHaveCount(46)
    await expect(tablePlayer(page, 'Ada')).toBeVisible()
    await expect(tablePlayer(page, 'Planner 01')).toBeVisible()
    await expect(tablePlayer(page, 'Planner 45')).toBeVisible()
    await expect(page.getByTestId('room-reveal-votes')).toBeEnabled()

    await setRoomDisplayMode(page, 'grid')

    await expect(page.getByTestId('room-grid-player')).toHaveCount(46)
    await expect(gridPlayer(page, 'Planner 01')).toBeVisible()
    await expect(gridPlayer(page, 'Planner 45')).toBeVisible()

    await setRoomDisplayMode(page, 'simple')
    await expect(page.getByTestId('room-simple-view')).toBeVisible()
    await page.getByTestId('room-reveal-votes').click()

    await expect(page.getByTestId('room-hide-votes')).toBeVisible()
    await expect(resultCard(page, '1')).toBeVisible()
    await expect(resultCard(page, '2')).toBeVisible()
    await expect(resultCard(page, '3')).toBeVisible()
    await expect(resultCard(page, '5')).toBeVisible()
    await expect(resultCard(page, '8')).toBeVisible()
  })

  test('Scenario: room view modes include simple room layout', async ({ page }) => {
    await createRoomForTest(page, { name: 'View mode planning' })

    await setRoomDisplayMode(page, 'grid')
    await expect(page.getByTestId('room-results-grid')).toBeVisible()

    await setRoomDisplayMode(page, 'simple')
    await expect(page.getByTestId('room-simple-view')).toBeVisible()
    await expect(page.getByTestId('room-results-grid')).toBeVisible()
    await expect(voteCard(page, '5')).toBeVisible()
    await expect(page.getByTestId('vote-dock-toggle')).toHaveCount(0)
    await expect(page.getByText('Voting deck')).toHaveCount(0)
    await expect(page.getByText(/Playing as/)).toHaveCount(0)

    await voteCard(page, '5').click()
    await page.getByTestId('room-reveal-votes').click()

    await expect(page.getByTestId('round-insights-toggle')).toContainText('Consensus')
    await page.getByTestId('round-insights-toggle').click()
    await expect(resultCard(page, '5')).toBeVisible()
  })

  test('Scenario: room view modes include console and group status layouts', async ({ page, browser }) => {
    const room = await createRoomForTest(page, {
      name: 'Experimental view planning',
      configure: async roomPage => {
        await roomPage.getByTestId('room-toggle-reactions').check()
      },
    })
    const eva = await joinRoomAs(browser, room, 'Eva')
    await seedRoomParticipants(page, room.id, [
      { name: 'Mystery', vote: '?' },
      { name: 'Bean', vote: '☕' },
    ])

    try {
      await setRoomDisplayMode(page, 'console')

      await expect(page.getByTestId('room-console-view')).toBeVisible()
      await expect(page.getByTestId('room-console-line').filter({ hasText: 'Console attached' })).toBeVisible()
      await expect(page.getByTestId('room-console-line').filter({ hasText: 'Ada is in the lobby.' })).toBeVisible()
      await expect(page.getByTestId('room-console-vote-panel')).toHaveCount(0)
      await expect(page.locator('.console-room-body')).not.toHaveClass(/console-room-body-with-votes/)
      await page.locator('html').evaluate(element => {
        element.dataset.theme = 'midnight'
      })
      await expect.poll(async () => page.getByTestId('room-console-view').evaluate(element => getComputedStyle(element).backgroundColor)).toBe('rgb(7, 9, 12)')
      await page.locator('html').evaluate(element => {
        element.dataset.theme = 'midnight-light'
      })
      await expect.poll(async () => page.getByTestId('room-console-view').evaluate(element => getComputedStyle(element).backgroundColor)).toBe('rgb(248, 250, 252)')
      await page.locator('html').evaluate(element => {
        element.dataset.theme = 'candy-light'
      })
      await expect.poll(async () => page.getByTestId('room-console-view').evaluate(element => getComputedStyle(element).backgroundColor)).toBe('rgb(248, 250, 252)')

      await voteCard(page, '5').click()
      await expect(page.locator('[data-test-id="room-console-line"][data-log-level="trace"]').filter({ hasText: 'Ada voted.' })).toBeVisible()

      await page.getByRole('button', { name: 'Send 👍 reaction' }).click()
      await expect(page.locator('[data-test-id="room-console-line"][data-log-level="trace"]').filter({ hasText: 'Ada reacted 👍.' })).toBeVisible()
      await expect(eva.page.getByTestId('floating-reaction').filter({ hasText: '👍' })).toBeVisible()

      await eva.page.getByRole('button', { name: 'Send 👍 reaction' }).click()
      await expect(page.locator('[data-test-id="room-console-line"][data-log-level="trace"]').filter({ hasText: 'Eva reacted 👍.' })).toBeVisible()

      await page.getByTestId('room-reveal-votes').click()
      await expect(page.getByTestId('room-console-vote-panel')).toBeVisible()
      await expect(page.getByTestId('room-console-vote-panel')).toContainText('revealedvote.ts')
      await expect(page.getByTestId('room-console-vote-object')).toContainText(/const\s*votes/)
      await expect(page.locator('.console-room-body')).toHaveClass(/console-room-body-with-votes/)
      await expect(page.locator('[data-test-id="room-console-vote-row"][data-player-name="Ada"]')).toContainText('"5"')
      await expect(page.locator('[data-test-id="room-console-vote-row"][data-player-name="Ada"]')).toContainText('Voted.')
      await expect(page.locator('[data-test-id="room-console-vote-row"][data-player-name="Eva"][data-result-state="missed"]')).toContainText('null')
      await expect(page.locator('[data-test-id="room-console-vote-row"][data-player-name="Eva"][data-result-state="missed"]')).toContainText('did not vote')
      await expect(page.locator('[data-test-id="room-console-vote-row"][data-player-name="Mystery"]')).toContainText('I don\'t know.')
      await expect(page.locator('[data-test-id="room-console-vote-row"][data-player-name="Bean"]')).toContainText('It\'s break time.')

      await setRoomDisplayMode(page, 'group-status')
      await expect(page.getByTestId('room-group-status-view')).toBeVisible()
      await expect(page.getByTestId('group-zone-deliberating')).toBeVisible()
      await expect(page.getByTestId('group-zone-ready')).toBeVisible()
      await expect(page.getByTestId('group-status-player-ready').filter({ hasText: 'Ada' })).toBeVisible()
      await expect(page.getByTestId('group-status-player-ready').filter({ hasText: '5' })).toBeVisible()
    } finally {
      await eva.close()
    }
  })

  test('Scenario: console view celebrates consensus after reveal', async ({ page }) => {
    const room = await createRoomForTest(page, { name: 'Console consensus planning' })
    await seedRoomParticipants(page, room.id, [{ name: 'Eva', vote: '5' }])

    await setRoomDisplayMode(page, 'console')

    await expect(page.getByTestId('room-console-view')).toBeVisible()
    await voteCard(page, '5').click()
    await page.getByTestId('room-reveal-votes').click()

    await expect(page.getByTestId('room-console-vote-panel')).toBeVisible()
    await expect(page.getByTestId('round-insights-toggle')).toContainText('Consensus')
    await expect(page.getByTestId('consensus-confetti')).toBeVisible()
  })

  test('Scenario: group status view moves a player when they vote', async ({ page }) => {
    await createRoomForTest(page, { name: 'Group status planning' })

    await setRoomDisplayMode(page, 'group-status')

    await expect(page.getByTestId('room-group-status-view')).toBeVisible()
    await expect(page.getByTestId('group-status-player-deliberating').filter({ hasText: 'Ada' })).toBeVisible()
    await expect(page.getByTestId('group-status-player-ready')).toHaveCount(0)

    await voteCard(page, '8').click()

    await expect(page.getByTestId('group-status-player-deliberating')).toHaveCount(0)
    await expect(page.getByTestId('group-status-player-ready').filter({ hasText: 'Ada' })).toBeVisible()
    await expect(page.getByTestId('group-status-player-ready').filter({ hasText: 'ready' })).toBeVisible()

    await page.getByTestId('room-reveal-votes').click()
    await expect(page.getByTestId('group-status-player-ready').filter({ hasText: '8' })).toBeVisible()
  })
})
