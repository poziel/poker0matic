import { expect, test } from '@playwright/test'
import {
  completeInitialNamePrompt,
  fillFirebaseConfigForm,
  openConfigurationModal,
  openProfileSettings,
  openUserMenu,
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
    await page.route('https://www.gravatar.com/avatar/**', async route => {
      await route.fulfill({
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'image/png',
        },
        body: pngPixel,
      })
    })

    await page.goto('/app')
    await completeInitialNamePrompt(page)
  })

  test('Scenario: a visitor can update their display name from the preferences modal', async ({ page }) => {
    await openProfileSettings(page)

    await page.getByTestId('profile-display-name-input').locator('input').fill('Grace')
    await page.getByTestId('profile-save').click()

    await expect(page.getByRole('heading', { name: 'Preferences' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: /Grace/ })).toBeVisible()
    await expect(page.evaluate(() => localStorage.getItem('refinimo_user_name'))).resolves.toBe('Grace')
  })

  test('Scenario: a visitor can update their theme from the preferences modal', async ({ page }) => {
    await openProfileSettings(page)

    await page.getByTestId('settings-section-theme').click()
    await expect(page.getByTestId('profile-theme-mode-system')).toBeVisible()
    await expect(page.getByTestId('profile-theme-midnight')).toBeVisible()
    await expect(page.getByTestId('profile-theme-midnight-light')).toHaveCount(0)
    await page.getByTestId('profile-theme-mode-dark').click()
    await page.getByTestId('profile-theme-ocean').click()
    await page.getByTestId('profile-save').click()

    await expect(page.getByRole('heading', { name: 'Preferences' })).toHaveCount(0)
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'ocean')
    await expect(page.evaluate(() => localStorage.getItem('refinimo_theme'))).resolves.toBe('ocean')
    await expect(page.evaluate(() => localStorage.getItem('refinimo_theme_mode'))).resolves.toBe('dark')
  })

  test('Scenario: a visitor can save a light-mode theme preference independently', async ({ page }) => {
    await openProfileSettings(page)

    await page.getByTestId('settings-section-theme').click()
    await page.getByTestId('profile-theme-mode-light').click()
    await page.getByTestId('profile-theme-ocean').click()
    await page.getByTestId('profile-save').click()

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'ocean-light')
    await expect(page.evaluate(() => localStorage.getItem('refinimo_theme'))).resolves.toBe('ocean')
    await expect(page.evaluate(() => localStorage.getItem('refinimo_theme_mode'))).resolves.toBe('light')
  })

  test('Scenario: a visitor can preview, randomize, and save a DiceBear avatar seed', async ({ page }) => {
    await openProfileSettings(page)

    await page.getByTestId('settings-section-avatar').click()
    await page.getByTestId('avatar-seed-input').fill('planning-seed')
    await expect(page.getByTestId('avatar-seed-input')).toHaveValue('planning-seed')
    await expect(page.locator('.avatar-live-preview-copy strong')).toHaveText('DiceBear')

    await page.getByTestId('avatar-randomize-seed').click()
    const randomizedSeed = await page.getByTestId('avatar-seed-input').inputValue()

    expect(randomizedSeed).toMatch(/^[a-zA-Z0-9]+$/)
    expect(randomizedSeed.length).toBeGreaterThanOrEqual(24)
    expect(randomizedSeed).not.toBe('planning-seed')

    await page.getByTestId('profile-save').click()

    await expect(page.evaluate(() => localStorage.getItem('refinimo_avatar_seed'))).resolves.toBe(randomizedSeed)
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
    const saveButton = page.getByTestId('profile-save')
    await expect(saveButton).toBeEnabled()
    await saveButton.focus()
    await page.keyboard.press('Enter')

    await expect(page.evaluate(() => localStorage.getItem('refinimo_avatar_source'))).resolves.toBe('custom')
    await expect(page.evaluate(() => localStorage.getItem('refinimo_custom_avatar_url'))).resolves.toBe(customAvatarUrl)
    await expect(page.evaluate(() => localStorage.getItem('refinimo_custom_avatar_crop'))).resolves.not.toBeNull()
  })

  test('Scenario: a visitor can switch to a Gravatar email and save it', async ({ page }) => {
    await openProfileSettings(page)

    await page.getByTestId('settings-section-avatar').click()
    await page.getByTestId('avatar-source-gravatar').click()
    await page.getByTestId('avatar-gravatar-email-input').locator('input').fill('Ada@Example.com')

    await expect(page.getByText('Ada@Example.com')).toBeVisible()
    await expect(page.locator('img[src*="b5fc85e55755f9e0d030a10ab4429b6b2944855f9a0d60077fe832becbc41d72"]').first()).toBeVisible()

    await page.getByTestId('profile-save').click()

    await expect(page.evaluate(() => localStorage.getItem('refinimo_avatar_source'))).resolves.toBe('gravatar')
    await expect(page.evaluate(() => localStorage.getItem('refinimo_gravatar_email'))).resolves.toBe('Ada@Example.com')
  })

  test('Scenario: a visitor can open keyboard shortcuts separately from About', async ({ page }) => {
    await openUserMenu(page)

    await page.getByTestId('user-menu-keyboard-shortcuts').click()
    await expect(page.getByRole('heading', { name: 'Keyboard shortcuts' })).toBeVisible()
    await expect(page.getByText('Global')).toBeVisible()
    await page.getByRole('button', { name: 'Close' }).click()

    await openUserMenu(page)
    await page.getByTestId('user-menu-about').click()
    await expect(page.getByRole('heading', { name: 'About' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Keyboard shortcuts' })).toHaveCount(0)
  })

  test('Scenario: a visitor can update Firebase configuration from the configuration modal', async ({ page }) => {
    await openConfigurationModal(page)
    await fillFirebaseConfigForm(page, {
      ...validFirebaseConfig,
      projectId: 'updated-project',
    }, { entryPoint: 'modal' })

    await expect(page.getByRole('heading', { name: 'Configuration' })).toHaveCount(0)
    await expect(page.evaluate(() => {
      const raw = localStorage.getItem('refinimo_config')
      return raw ? JSON.parse(atob(raw)).projectId : null
    })).resolves.toBe('updated-project')
  })

  test('Scenario: legacy Poker0Matic local settings migrate to Refinimo storage keys', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.removeItem('refinimo_user_name')
      localStorage.removeItem('refinimo_theme')
      localStorage.removeItem('refinimo_theme_mode')
      localStorage.setItem('poker_user_name', 'Legacy Grace')
      localStorage.setItem('poker_theme', 'ocean-light')
    })

    await page.goto('/app')

    await expect(page.getByRole('button', { name: /Legacy Grace/ })).toBeVisible()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'ocean-light')
    await expect(page.evaluate(() => localStorage.getItem('refinimo_user_name'))).resolves.toBe('Legacy Grace')
    await expect(page.evaluate(() => localStorage.getItem('refinimo_theme'))).resolves.toBe('ocean')
    await expect(page.evaluate(() => localStorage.getItem('refinimo_theme_mode'))).resolves.toBe('light')
  })
})
