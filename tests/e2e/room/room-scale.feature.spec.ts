import { expect, test } from '@playwright/test'
import { createRoomForTest, gridPlayer, resultCard, seedRoomParticipants, tablePlayer, voteCard } from '../support/roomFlows'

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

    await page.getByTestId('room-toggle-view').click()

    await expect(page.getByTestId('room-grid-player')).toHaveCount(46)
    await expect(gridPlayer(page, 'Planner 01')).toBeVisible()
    await expect(gridPlayer(page, 'Planner 45')).toBeVisible()

    await page.getByTestId('room-toggle-view').click()
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

    await page.getByTestId('room-toggle-view').click()
    await expect(page.getByTestId('room-results-grid')).toBeVisible()

    await page.getByTestId('room-toggle-view').click()
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

  test('Scenario: room view modes include console and group status layouts', async ({ page }) => {
    await createRoomForTest(page, { name: 'Experimental view planning' })

    await page.getByTestId('room-toggle-view').click()
    await page.getByTestId('room-toggle-view').click()
    await page.getByTestId('room-toggle-view').click()

    await expect(page.getByTestId('room-console-view')).toBeVisible()
    await expect(page.getByTestId('room-console-line').filter({ hasText: 'Ada' })).toContainText('[●]')
    await expect(page.getByTestId('room-console-line').filter({ hasText: 'Ada' })).toContainText('is thinking...')

    await voteCard(page, '5').click()
    await expect(page.getByTestId('room-console-line').filter({ hasText: 'Ada' })).toContainText('[✓]')
    await expect(page.getByTestId('room-console-line').filter({ hasText: 'Ada' })).toContainText('is ready.')

    await page.getByTestId('room-reveal-votes').click()
    await expect(page.getByTestId('room-console-line').filter({ hasText: 'Ada' })).toContainText('[ 5 ]')
    await expect(page.getByTestId('room-console-line').filter({ hasText: 'Ada' })).toContainText('voted 5')

    await page.getByTestId('room-toggle-view').click()
    await expect(page.getByTestId('room-group-status-view')).toBeVisible()
    await expect(page.getByTestId('group-zone-deliberating')).toBeVisible()
    await expect(page.getByTestId('group-zone-ready')).toBeVisible()
    await expect(page.getByTestId('group-status-player-ready').filter({ hasText: 'Ada' })).toBeVisible()
    await expect(page.getByTestId('group-status-player-ready').filter({ hasText: '5' })).toBeVisible()
  })

  test('Scenario: group status view moves a player when they vote', async ({ page }) => {
    await createRoomForTest(page, { name: 'Group status planning' })

    await page.getByTestId('room-toggle-view').click()
    await page.getByTestId('room-toggle-view').click()
    await page.getByTestId('room-toggle-view').click()
    await page.getByTestId('room-toggle-view').click()

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
