import { expect, test } from '@playwright/test'
import { openProfileSettings } from '../support/appFlows'
import { createRoomForTest, resultCard, setRoomDisplayMode, tablePlayer, voteCard } from '../support/roomFlows'

test.describe('Feature: room workflow', () => {
  test('Scenario: a newly created room opens with the creator ready to vote', async ({ page }) => {
    await createRoomForTest(page, { name: 'Workflow planning' })

    await expect(page).toHaveTitle('0/1 - Ada - Workflow planning - Refinimo')
    await expect(page.getByTestId('room-round-label')).toHaveText('Round 1')
    await expect(page.getByTestId('room-vote-count')).toHaveText('0/1 voted')
    await expect(tablePlayer(page, 'Ada')).toBeVisible()
    await expect(voteCard(page, '0')).toBeVisible()
    await expect(voteCard(page, '1')).toBeVisible()
    await expect(voteCard(page, '5')).toBeVisible()
    await expect(voteCard(page, '?')).toBeVisible()
    await expect(page.locator('[data-test-id="vote-card"][data-card-value="☕"]')).toBeVisible()
    await expect(page.getByTestId('room-reveal-votes')).toBeDisabled()
    await expect(page.getByTestId('room-reset-round')).toBeEnabled()
  })

  test('Scenario: a participant can select, change, and clear their vote before reveal', async ({ page }) => {
    await createRoomForTest(page)

    await voteCard(page, '5').click()
    await expect(voteCard(page, '5')).toHaveClass(/selected/)
    await expect(page.getByTestId('room-vote-count')).toHaveText('1/1 voted')
    await expect(page.getByTestId('room-reveal-votes')).toBeEnabled()

    await voteCard(page, '8').click()
    await expect(voteCard(page, '5')).not.toHaveClass(/selected/)
    await expect(voteCard(page, '8')).toHaveClass(/selected/)
    await expect(page.getByTestId('room-vote-count')).toHaveText('1/1 voted')

    await voteCard(page, '8').click()
    await expect(voteCard(page, '8')).not.toHaveClass(/selected/)
    await expect(page.getByTestId('room-vote-count')).toHaveText('0/1 voted')
    await expect(page.getByTestId('room-reveal-votes')).toBeDisabled()
  })

  test('Scenario: votes can be revealed and hidden without clearing the current vote', async ({ page }) => {
    const room = await createRoomForTest(page)

    await voteCard(page, '5').click()
    await expect(page).toHaveTitle(`Vote done - Ada - ${room.name} - Refinimo`)
    await page.getByTestId('room-reveal-votes').click()

    await expect(page).toHaveTitle(`Vote done - Ada - ${room.name} - Refinimo`)
    await expect(page.getByTestId('room-hide-votes')).toBeVisible()
    await expect(page.getByTestId('room-next-round')).toBeVisible()
    await expect(page.getByTestId('round-insights-toggle')).toContainText('Consensus')
    await expect(page.getByTestId('round-insights-toggle')).toContainText('Avg')
    await expect(page.getByTestId('round-insights-toggle')).toContainText('Closest')
    await page.getByTestId('round-insights-toggle').click()
    await expect(resultCard(page, '5')).toBeVisible()
    await expect(voteCard(page, '5')).toHaveClass(/selected/)
    await expect(voteCard(page, '5')).toBeDisabled()
    await expect(voteCard(page, '8')).toBeDisabled()
    await expect(page.getByTestId('round-insights-toggle')).toContainText('Consensus')

    await page.getByTestId('room-hide-votes').click()

    await expect(page.getByTestId('room-reveal-votes')).toBeVisible()
    await expect(page.getByTestId('room-vote-count')).toHaveText('1/1 voted')
    await expect(voteCard(page, '5')).toHaveClass(/selected/)
  })

  test('Scenario: an enabled room allows vote changes after reveal', async ({ page }) => {
    await createRoomForTest(page, {
      configure: async roomPage => {
        await roomPage.getByTestId('room-toggle-post-reveal-voting').check()
      },
    })

    await voteCard(page, '5').click()
    await page.getByTestId('room-reveal-votes').click()

    await expect(page.getByTestId('round-insights-toggle')).toContainText('Consensus')
    await expect(voteCard(page, '5')).toHaveClass(/selected/)
    await expect(voteCard(page, '8')).toBeVisible()

    await voteCard(page, '8').click()

    await expect(voteCard(page, '5')).not.toHaveClass(/selected/)
    await expect(voteCard(page, '8')).toHaveClass(/selected/)
    await page.getByTestId('round-insights-toggle').click()
    await expect(resultCard(page, '8')).toBeVisible()
    await expect(resultCard(page, '5')).toHaveCount(0)
    await expect(page.getByTestId('room-hide-votes')).toBeVisible()

    await setRoomDisplayMode(page, 'console')

    await expect(page.getByTestId('room-console-view')).toBeVisible()
    await expect(page.locator('[data-test-id="room-console-line"][data-log-level="trace"]').filter({ hasText: 'Ada changed their vote.' })).toBeVisible()
    await expect(page.getByTestId('room-console-vote-panel')).toContainText('revealedvote.ts')
    await expect(page.getByTestId('room-console-vote-object')).toContainText(/const\s*votes/)
    await expect(page.locator('[data-test-id="room-console-vote-row"][data-player-name="Ada"]')).toContainText('"8"')
  })

  test('Scenario: saving an avatar update refreshes the current room participant', async ({ page }) => {
    await createRoomForTest(page, { name: 'Avatar sync planning' })

    const roomAvatar = tablePlayer(page, 'Ada').locator('.player-avatar-frame img')
    const menuAvatar = page.getByTestId('user-menu-button').locator('.player-avatar-frame img')
    const initialRoomSrc = await roomAvatar.getAttribute('src')

    await openProfileSettings(page)
    await page.getByTestId('settings-section-avatar').click()
    await page.getByTestId('avatar-seed-input').fill('room-sync-seed')
    await page.getByLabel('Follow theme accent').check()
    await page.getByTestId('profile-save').click()

    await expect.poll(() => roomAvatar.getAttribute('src')).not.toBe(initialRoomSrc)
    await expect.poll(() => menuAvatar.getAttribute('src')).toBe(await roomAvatar.getAttribute('src'))
    await expect(roomAvatar).toHaveAttribute('src', /backgroundColor=4f8cff/)
    await expect(menuAvatar).not.toHaveAttribute('src', /backgroundColor=ffffff/)
  })

  test('Scenario: console view logs vote changes from an external voting dock', async ({ page }) => {
    const room = await createRoomForTest(page, { name: 'External dock console updates' })
    await setRoomDisplayMode(page, 'console')
    await expect(page.getByTestId('room-toggle-view')).toHaveCount(0)
    await expect(page.getByTestId('room-console-view')).toBeVisible()

    const dockPage = await page.context().newPage()
    try {
      await dockPage.goto(`/app/dock/${room.id}`)
      await expect(dockPage.locator('.dock-window')).toBeVisible()
      await expect(voteCard(dockPage, '3')).toBeVisible()

      await voteCard(dockPage, '3').click()
      await expect(page.locator('[data-test-id="room-console-line"][data-log-level="trace"]').filter({ hasText: 'Ada voted.' })).toBeVisible()

      await voteCard(dockPage, '5').click()
      await expect(page.locator('[data-test-id="room-console-line"][data-log-level="trace"]').filter({ hasText: 'Ada changed their vote.' })).toBeVisible()

      await page.getByTestId('room-reveal-votes').click()
      await expect(page.locator('[data-test-id="room-console-vote-row"][data-player-name="Ada"]')).toContainText('"5"')
    } finally {
      await dockPage.close()
    }
  })

  test('Scenario: resetting a round clears the vote and keeps the room on the same round', async ({ page }) => {
    await createRoomForTest(page)

    await voteCard(page, '3').click()
    await expect(page.getByTestId('room-vote-count')).toHaveText('1/1 voted')

    await page.getByTestId('room-reset-round').click()

    await expect(page.getByTestId('room-round-label')).toHaveText('Round 1')
    await expect(page.getByTestId('room-vote-count')).toHaveText('0/1 voted')
    await expect(voteCard(page, '3')).not.toHaveClass(/selected/)
    await expect(page.getByTestId('room-reveal-votes')).toBeDisabled()
  })

  test('Scenario: advancing after reveal starts the next round and records history', async ({ page }) => {
    await createRoomForTest(page)

    await voteCard(page, '8').click()
    await page.getByTestId('room-reveal-votes').click()
    await page.getByTestId('round-insights-toggle').click()
    await expect(resultCard(page, '8')).toBeVisible()

    await page.getByTestId('room-next-round').click()

    await expect(page.getByTestId('room-round-label')).toHaveText('Round 2')
    await expect(page.getByTestId('room-vote-count')).toHaveText('0/1 voted')

    await page.getByTestId('room-toggle-panel').click()

    await expect(page.getByTestId('room-history-entry')).toHaveCount(1)
    await expect(page.getByTestId('room-history-entry').first()).toContainText('Round 1')
    await expect(page.getByTestId('room-history-entry').first()).toContainText('8')
  })
})
