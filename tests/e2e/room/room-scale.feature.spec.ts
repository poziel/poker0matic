import { expect, test } from '@playwright/test'
import { createRoomForTest, gridPlayer, resultCard, seedRoomParticipants, tablePlayer } from '../support/roomFlows'

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
    await page.getByTestId('room-reveal-votes').click()

    await expect(page.getByTestId('room-hide-votes')).toBeVisible()
    await expect(resultCard(page, '1')).toBeVisible()
    await expect(resultCard(page, '2')).toBeVisible()
    await expect(resultCard(page, '3')).toBeVisible()
    await expect(resultCard(page, '5')).toBeVisible()
    await expect(resultCard(page, '8')).toBeVisible()
  })
})
