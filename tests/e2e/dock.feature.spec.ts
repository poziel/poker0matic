import { expect, test } from '@playwright/test'

test.describe('Feature: voting dock window', () => {
  test('Scenario: the dock route renders only the dock surface', async ({ page }) => {
    await page.goto('/app/dock/demo-room')

    await expect(page.locator('.dock-window')).toBeVisible()
    await expect(page.locator('.hdr')).toHaveCount(0)
    await expect(page.getByTestId('user-menu-button')).toHaveCount(0)
    await expect(page.getByRole('heading', { name: 'What\'s your name?' })).toHaveCount(0)
    await expect(page.getByText('Firebase configuration is missing in this window.')).toBeVisible()
  })
})
