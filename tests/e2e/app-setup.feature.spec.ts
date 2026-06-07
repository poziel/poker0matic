import { expect, test } from '@playwright/test'
import {
  completeInitialNamePrompt,
  encodeFirebaseConfig,
  fillFirebaseConfigForm,
  incompleteFirebaseConfig,
  stubFirebaseHealthCheck,
  validFirebaseConfig,
} from './support/appFlows'

test.describe('Feature: app setup and configuration', () => {
  test.beforeEach(async ({ page }) => {
    await stubFirebaseHealthCheck(page)
    await page.goto('/app')
    await completeInitialNamePrompt(page)
  })

  test('Scenario: a named visitor sees Firebase setup guidance before room actions are available', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Connect to Firebase' })).toBeVisible()
    await expect(page.getByText('To create and join planning rooms')).toBeVisible()
    await expect(page.getByTestId('app-open-configuration')).toBeVisible()
    await expect(page.getByTestId('app-create-room')).toHaveCount(0)
  })

  test('Scenario: protected room routes redirect to the config page when Firebase config is missing', async ({ page }) => {
    await page.goto('/app/room/demo-room')

    await expect(page).toHaveURL(/\/app\/config\?e$/)
    await expect(page.getByText('No Firebase config found. Enter your project credentials below.')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Firebase Config' })).toBeVisible()
  })

  test('Scenario: create room routes redirect to the config page when Firebase config is missing', async ({ page }) => {
    await page.goto('/app/create')

    await expect(page).toHaveURL(/\/app\/config\?e$/)
    await expect(page.getByRole('heading', { name: 'Firebase Config' })).toBeVisible()
  })

  test('Scenario: a visitor can save Firebase config and reach the room lobby', async ({ page }) => {
    await fillFirebaseConfigForm(page, validFirebaseConfig, { url: '/app/config?e' })

    await expect(page).toHaveURL(/\/app$/)
    await expect(page.getByRole('heading', { name: 'Start or join a room' })).toBeVisible()
    await expect(page.getByTestId('app-create-room')).toBeVisible()
    await expect(page.getByTestId('app-room-code-input')).toBeVisible()
    await expect(page.getByTestId('app-join-room')).toBeDisabled()
  })

  test('Scenario: the join room action becomes available after a room code is entered', async ({ page }) => {
    await page.goto(`/?config=${encodeURIComponent(encodeFirebaseConfig(validFirebaseConfig))}`)

    await expect(page.getByRole('heading', { name: 'Start or join a room' })).toBeVisible()
    await expect(page.getByTestId('app-join-room')).toBeDisabled()

    await page.getByTestId('app-room-code-input').locator('input').fill('demo-room')

    await expect(page.getByTestId('app-join-room')).toBeEnabled()
  })

  test('Scenario: shared config links load the config and clean up the URL', async ({ page }) => {
    await page.goto(`/?config=${encodeURIComponent(encodeFirebaseConfig(validFirebaseConfig))}`)

    await expect(page).toHaveURL(/\/app$/)
    await expect(page.getByRole('heading', { name: 'Start or join a room' })).toBeVisible()
  })

  test('Scenario: incomplete saved config keeps visitors in setup mode', async ({ page }) => {
    await fillFirebaseConfigForm(page, incompleteFirebaseConfig)

    await expect(page).toHaveURL(/\/app$/)
    await expect(page.getByRole('heading', { name: 'Connect to Firebase' })).toBeVisible()
    await expect(page.getByTestId('app-create-room')).toHaveCount(0)
  })
})
