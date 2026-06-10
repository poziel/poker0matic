import { expect, test } from '@playwright/test'
import { visitConfiguredApp } from './support/appFlows'

test.describe('Feature: room creation', () => {
  test.beforeEach(async ({ page }) => {
    await visitConfiguredApp(page)
    await page.getByTestId('app-create-room').click()
    await expect(page.getByRole('heading', { name: 'Create a room' })).toBeVisible()
    await expect(page).toHaveTitle('Ada - Create room - Refinimo')
  })

  test('Scenario: a visitor sees the expected default room creation settings', async ({ page }) => {
    await expect(page.getByTestId('create-room-submit')).toBeDisabled()
    await expect(page.getByTestId('room-deck-fibonacci')).toHaveClass(/active/)
    await expect(page.getByTestId('room-deck-linear')).toBeVisible()
    await expect(page.getByTestId('room-deck-tshirt')).toBeVisible()
    await expect(page.getByTestId('room-deck-custom')).toBeVisible()
    await expect(page.getByTestId('room-custom-deck-input')).toHaveCount(0)
    await expect(page.getByTestId('room-toggle-question')).toBeChecked()
    await expect(page.getByTestId('room-toggle-break')).toBeChecked()
    await expect(page.getByTestId('room-toggle-history')).toBeChecked()
    await expect(page.getByTestId('room-toggle-post-reveal-voting')).not.toBeChecked()
    await expect(page.getByTestId('room-toggle-task-info')).not.toBeChecked()
    await expect(page.getByTestId('room-toggle-timer')).not.toBeChecked()
    await expect(page.getByTestId('room-toggle-reactions')).not.toBeChecked()
    await expect(page.getByTestId('room-toggle-leader-mode')).not.toBeChecked()
  })

  test('Scenario: a visitor can configure optional room settings before creating', async ({ page }) => {
    await page.getByTestId('room-name-input').locator('input').fill('Sprint 42 planning')
    await expect(page.getByTestId('create-room-submit')).toBeEnabled()

    await page.getByTestId('room-deck-custom').click()
    await expect(page.getByTestId('room-deck-custom')).toHaveClass(/active/)
    await page.getByTestId('room-custom-deck-input').locator('input').fill('1, 2, 3, 5, 8, 13')

    await page.getByTestId('room-toggle-question').uncheck()
    await page.getByTestId('room-toggle-break').uncheck()
    await page.getByTestId('room-toggle-post-reveal-voting').check()
    await page.getByTestId('room-toggle-task-info').check()
    await page.getByTestId('room-toggle-timer').check()
    await expect(page.getByTestId('room-toggle-timer-auto-reveal')).toBeChecked()
    await page.getByTestId('room-timer-mode-manual').click()
    await page.getByTestId('room-timer-duration-input').locator('input').fill('180')
    await page.getByTestId('room-toggle-timer-warning').check()
    await page.getByTestId('room-timer-warning-type-percentage').click()
    await page.getByTestId('room-timer-warning-value-input').locator('input').fill('25')

    await page.getByTestId('room-toggle-reactions').check()
    await page.getByTestId('room-reaction-emoji-1').fill('👍')
    await page.getByTestId('room-reaction-emoji-2').fill('👀')
    await page.getByTestId('room-toggle-leader-mode').check()

    await expect(page.getByTestId('room-custom-deck-input').locator('input')).toHaveValue('1, 2, 3, 5, 8, 13')
    await expect(page.getByTestId('room-toggle-question')).not.toBeChecked()
    await expect(page.getByTestId('room-toggle-break')).not.toBeChecked()
    await expect(page.getByTestId('room-toggle-post-reveal-voting')).toBeChecked()
    await expect(page.getByTestId('room-toggle-task-info')).toBeChecked()
    await expect(page.getByTestId('room-toggle-timer')).toBeChecked()
    await expect(page.getByTestId('room-timer-duration-input').locator('input')).toHaveValue('180')
    await expect(page.getByTestId('room-toggle-timer-warning')).toBeChecked()
    await expect(page.getByTestId('room-timer-warning-value-input').locator('input')).toHaveValue('25')
    await expect(page.getByTestId('room-toggle-reactions')).toBeChecked()
    await expect(page.getByTestId('room-reaction-emoji-1')).toHaveValue('👍')
    await expect(page.getByTestId('room-reaction-emoji-2')).toHaveValue('👀')
    await expect(page.getByTestId('room-toggle-leader-mode')).toBeChecked()
  })

  test('Scenario: a visitor can create a named room and enter the generated room route', async ({ page }) => {
    await page.getByTestId('room-name-input').locator('input').fill('Backlog refinement')
    await page.getByTestId('room-deck-linear').click()
    await page.getByTestId('create-room-submit').click()

    await expect(page).toHaveURL(/\/app\/room\/[a-z0-9]+$/)
  })
})
