import { expect, type Page, test } from '@playwright/test'

async function givenTheLandingPageIsOpen (page: Page) {
  await page.goto('/')
  await expect(page).toHaveTitle(/Refinimo/)
}

async function whenTheVisitorOpensTheHowItWorksTab (page: Page) {
  await page.getByTestId('landing-tab-firebase').click()
}

async function whenTheVisitorOpensTheAboutTab (page: Page) {
  await page.getByTestId('landing-tab-about').click()
}

test.describe('Feature: Landing page discovery', () => {
  test('Scenario: a visitor can render and navigate the public landing content', async ({ page }) => {
    await givenTheLandingPageIsOpen(page)

    await expect(page.getByRole('heading', {
      name: /Run estimation sessions without turning your backlog into a spreadsheet circus\./,
    })).toBeVisible()
    await expect(page.getByText('Planning poker for scrum teams', { exact: true })).toBeVisible()
    await expect(page.getByTestId('landing-primary-action')).toHaveAccessibleName(/Start planning|Open app/)

    await whenTheVisitorOpensTheHowItWorksTab(page)
    await expect(page.getByRole('heading', {
      name: 'Refinimo stays free by letting each team bring its own Firebase project.',
    })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Show rules' })).toBeVisible()

    await whenTheVisitorOpensTheAboutTab(page)
    await expect(page.getByRole('heading', { name: 'Special thanks to sky0matic' })).toBeVisible()
  })

  test('Scenario: a visitor can expand, copy, and collapse the Firebase rules example', async ({ context, page }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await givenTheLandingPageIsOpen(page)
    await whenTheVisitorOpensTheHowItWorksTab(page)

    await expect(page.getByText('"rooms":')).toHaveCount(0)

    await page.getByTestId('landing-toggle-rules').click()
    await expect(page.getByText('"rooms":')).toBeVisible()
    await expect(page.getByTestId('landing-toggle-rules')).toHaveText(/Hide rules/)

    await page.getByTestId('landing-copy-rules').click()

    await expect(page.getByText('Firebase rules copied.')).toBeVisible()
    await expect(page.evaluate(() => navigator.clipboard.readText())).resolves.toContain('"rooms"')

    await page.getByTestId('landing-toggle-rules').click()
    await expect(page.getByText('"rooms":')).toHaveCount(0)
  })

  test('Scenario: the primary landing action opens the app setup flow', async ({ page }) => {
    await givenTheLandingPageIsOpen(page)

    await page.getByTestId('landing-primary-action').click()

    await expect(page).toHaveURL(/\/app$/)
    await expect(page.getByRole('heading', { name: 'Connect to Firebase' })).toBeVisible()
  })
})
