import { defineConfig, devices } from '@playwright/test'

const port = Number(process.env.PORT ?? 3000)
const baseURL = `http://127.0.0.1:${port}`
const basePath = '/poker0matic/'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 2,
  reporter: process.env.CI
    ? [
        ['list'],
        ['html', { open: 'never' }],
      ]
    : 'list',
  use: {
    baseURL,
    screenshot: 'only-on-failure',
    testIdAttribute: 'data-test-id',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },
  webServer: {
    command: `npm run dev -- --host 127.0.0.1 --port ${port}`,
    url: `${baseURL}${basePath}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
