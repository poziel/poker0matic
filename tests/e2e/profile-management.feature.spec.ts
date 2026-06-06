import { expect, test } from '@playwright/test'
import {
  completeInitialNamePrompt,
  fillFirebaseConfigForm,
  openConfigurationModal,
  openProfileSettings,
  stubFirebaseHealthCheck,
  validFirebaseConfig,
} from './support/appFlows'

const customAvatarUrl = 'https://avatar.example.test/ada.png'
const pngPixel = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64',
)

test.describe('Feature: profile and configuration management', () => {
  test.beforeEach(async ({ page }) => {
    await stubFirebaseHealthCheck(page)
    await page.route(customAvatarUrl, async route => {
      await route.fulfill({
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'image/png',
        },
        body: pngPixel,
      })
    })

    await page.goto('/poker0matic/app')
    await completeInitialNamePrompt(page)
  })

  test('Scenario: a visitor can update their display name from the profile modal', async ({ page }) => {
    await openProfileSettings(page)

    await page.getByTestId('profile-display-name-input').locator('input').fill('Grace')
    await page.getByTestId('profile-save').click()

    await expect(page.getByRole('heading', { name: 'Profile' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: /Grace/ })).toBeVisible()
    await expect(page.evaluate(() => localStorage.getItem('poker_user_name'))).resolves.toBe('Grace')
  })

  test('Scenario: a visitor can update their theme from the profile modal', async ({ page }) => {
    await openProfileSettings(page)

    await page.getByTestId('settings-section-theme').click()
    await page.getByTestId('profile-theme-ocean').click()
    await page.getByTestId('profile-save').click()

    await expect(page.getByRole('heading', { name: 'Profile' })).toHaveCount(0)
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'ocean')
    await expect(page.evaluate(() => localStorage.getItem('poker_theme'))).resolves.toBe('ocean')
  })

  test('Scenario: a visitor can preview, randomize, and save a DiceBear avatar seed', async ({ page }) => {
    await openProfileSettings(page)

    await page.getByTestId('settings-section-avatar').click()
    await page.getByTestId('avatar-seed-input').fill('planning-seed')
    await page.getByTestId('avatar-preview').click()
    await expect(page.getByTestId('avatar-style-grid').locator('img[src*="planning-seed"]').first()).toBeVisible()

    await page.getByTestId('avatar-randomize-seed').click()
    const randomizedSeed = await page.getByTestId('avatar-seed-input').inputValue()

    expect(randomizedSeed).toMatch(/^avatar-/)
    expect(randomizedSeed).not.toBe('planning-seed')

    await page.getByTestId('profile-save').click()

    await expect(page.evaluate(() => localStorage.getItem('poker_avatar_seed'))).resolves.toBe(randomizedSeed)
  })

  test('Scenario: a visitor can switch to a custom avatar URL, crop it, and save it', async ({ page }) => {
    await openProfileSettings(page)

    await page.getByTestId('settings-section-avatar').click()
    await page.getByTestId('avatar-source-custom').click()
    await page.getByTestId('avatar-custom-url-input').locator('input').fill(customAvatarUrl)

    await expect(page.getByTestId('avatar-custom-cropper')).toBeVisible()
    await expect(page.getByText('Checking image content...')).toBeHidden({ timeout: 15_000 })

    const cropper = page.getByTestId('avatar-custom-cropper')
    const box = await cropper.boundingBox()
    expect(box).not.toBeNull()

    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2)
    await page.mouse.down()
    await page.mouse.move(box!.x + box!.width / 2 + 8, box!.y + box!.height / 2 + 8)
    await page.mouse.up()
    await page.getByTestId('profile-save').click()

    await expect(page.evaluate(() => localStorage.getItem('poker_avatar_source'))).resolves.toBe('custom')
    await expect(page.evaluate(() => localStorage.getItem('poker_custom_avatar_url'))).resolves.toBe(customAvatarUrl)
    await expect(page.evaluate(() => localStorage.getItem('poker_custom_avatar_crop'))).resolves.not.toBeNull()
  })

  test('Scenario: a visitor can update Firebase configuration from the configuration modal', async ({ page }) => {
    await openConfigurationModal(page)
    await fillFirebaseConfigForm(page, {
      ...validFirebaseConfig,
      projectId: 'updated-project',
    }, { entryPoint: 'modal' })

    await expect(page.getByRole('heading', { name: 'Configuration' })).toHaveCount(0)
    await expect(page.evaluate(() => {
      const raw = localStorage.getItem('poker_config')
      return raw ? JSON.parse(atob(raw)).projectId : null
    })).resolves.toBe('updated-project')
  })
})
