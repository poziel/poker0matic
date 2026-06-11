import { expect, test } from '@playwright/test'
import { createRoomForTest, joinRoomAs, resultCard, tablePlayer, voteCard } from '../support/roomFlows'

test.describe('Feature: multiplayer room workflow', () => {
  test('Scenario: multiple participants can join, vote, and reveal shared results', async ({ browser, page }) => {
    const room = await createRoomForTest(page, { name: 'Multiplayer planning' })
    const bob = await joinRoomAs(browser, room, 'Bob')
    const grace = await joinRoomAs(browser, room, 'Grace')

    try {
      for (const participantPage of [page, bob.page, grace.page]) {
        await expect(tablePlayer(participantPage, 'Ada')).toBeVisible()
        await expect(tablePlayer(participantPage, 'Bob')).toBeVisible()
        await expect(tablePlayer(participantPage, 'Grace')).toBeVisible()
        await expect(participantPage.getByTestId('room-vote-count')).toHaveText('0/3 voted')
      }

      await voteCard(page, '8').click()
      await voteCard(bob.page, '3').click()
      await voteCard(grace.page, '5').click()

      for (const participantPage of [page, bob.page, grace.page]) {
        await expect(participantPage.getByTestId('room-vote-count')).toHaveText('3/3 voted')
      }

      await page.getByTestId('room-reveal-votes').click()

      for (const participantPage of [page, bob.page, grace.page]) {
        await expect(participantPage.getByTestId('room-hide-votes')).toBeVisible()
        await expect(resultCard(participantPage, '3')).toBeVisible()
        await expect(resultCard(participantPage, '5')).toBeVisible()
        await expect(resultCard(participantPage, '8')).toBeVisible()
        await expect(participantPage.getByTestId('round-insights-toggle')).toContainText('Avg')
      }
    } finally {
      await bob.close()
      await grace.close()
    }
  })
})
