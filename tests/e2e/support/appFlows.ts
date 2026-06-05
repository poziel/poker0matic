import { expect, type Page } from '@playwright/test'

export interface TestFirebaseConfig {
  apiKey: string
  authDomain: string
  databaseUrl: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
}

export const validFirebaseConfig: TestFirebaseConfig = {
  apiKey: 'demo-api-key',
  authDomain: 'demo.firebaseapp.com',
  databaseUrl: 'https://valid-db.example.test',
  projectId: 'demo-project',
  storageBucket: 'demo.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:abcdef',
}

export const incompleteFirebaseConfig: TestFirebaseConfig = {
  ...validFirebaseConfig,
  databaseUrl: '',
}

export function encodeFirebaseConfig (config: TestFirebaseConfig) {
  return Buffer.from(JSON.stringify(config)).toString('base64')
}

export type FirebaseConfigWorkflow = (
  | { entryPoint?: 'page', url?: string }
  | { entryPoint: 'modal' }
)

export async function stubFirebaseHealthCheck (page: Page, config = validFirebaseConfig) {
  await page.route(`${config.databaseUrl}/**`, async route => {
    await route.fulfill({
      status: 403,
      body: '{}',
    })
  })
}

export async function completeInitialNamePrompt (page: Page, name = 'Ada') {
  await expect(page.getByRole('heading', { name: 'What\'s your name?' })).toBeVisible()
  await expect(page.getByTestId('initial-name-continue')).toBeDisabled()

  await page.getByTestId('initial-name-input').locator('input').fill(name)
  await page.getByTestId('initial-name-continue').click()

  await expect(page.getByRole('heading', { name: 'What\'s your name?' })).toHaveCount(0)
}

export async function visitConfiguredApp (page: Page, name = 'Ada') {
  await stubFirebaseHealthCheck(page)
  await page.goto('/poker0matic/app')
  await completeInitialNamePrompt(page, name)
  await page.goto(`/poker0matic/?config=${encodeURIComponent(encodeFirebaseConfig(validFirebaseConfig))}`)
  await expect(page.getByRole('heading', { name: 'Start or join a room' })).toBeVisible()
}

export async function fillFirebaseConfigForm (
  page: Page,
  config: TestFirebaseConfig,
  workflow: FirebaseConfigWorkflow = {},
) {
  let form = page.getByTestId('firebase-config-page-form')

  if (workflow.entryPoint === 'modal') {
    if (await page.getByRole('heading', { name: 'Configuration' }).count() === 0) {
      const setupButton = page.getByTestId('app-open-configuration')
      const reviewButton = page.getByTestId('app-review-configuration')
      await ((await setupButton.isVisible()) ? setupButton.click() : reviewButton.click())
    }
    await expect(page.getByRole('heading', { name: 'Configuration' })).toBeVisible()
    form = page.getByTestId('firebase-config-modal-form')
  } else {
    await page.goto(workflow.url ?? '/poker0matic/app/config')
    await expect(page.getByRole('heading', { name: 'Firebase Config' })).toBeVisible()
  }

  await form.getByTestId('firebase-api-key-input').locator('input').fill(config.apiKey)
  await form.getByTestId('firebase-auth-domain-input').locator('input').fill(config.authDomain)
  await form.getByTestId('firebase-database-url-input').locator('input').fill(config.databaseUrl)
  await form.getByTestId('firebase-project-id-input').locator('input').fill(config.projectId)
  await form.getByTestId('firebase-storage-bucket-input').locator('input').fill(config.storageBucket)
  await form.getByTestId('firebase-messaging-sender-id-input').locator('input').fill(config.messagingSenderId)
  await form.getByTestId('firebase-app-id-input').locator('input').fill(config.appId)
  const saveConfigButton = workflow.entryPoint === 'modal'
    ? page.getByTestId('firebase-save-config').last()
    : page.getByTestId('firebase-save-config').first()
  await saveConfigButton.click()
  await expect(page.getByText('Checking…')).toBeHidden({ timeout: 5000 })
}

export async function openUserMenu (page: Page, name = 'Ada') {
  await expect(page.getByTestId('user-menu-button')).toContainText(name)
  await page.getByTestId('user-menu-button').click()
}

export async function openProfileSettings (page: Page, name = 'Ada') {
  await openUserMenu(page, name)
  await page.getByTestId('user-menu-profile').click()
  await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible()
}

export async function openConfigurationModal (page: Page, name = 'Ada') {
  await openUserMenu(page, name)
  await page.getByTestId('user-menu-configuration').click()
  await expect(page.getByRole('heading', { name: 'Configuration' })).toBeVisible()
}
