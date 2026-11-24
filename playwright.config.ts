import { defineConfig, devices } from '@playwright/test'

const PORT = 5179

// Two suites, both in a real browser:
//  - tests/visual: screenshot each component and diff against the stored
//    baseline. Baselines live in tests/visual/__screenshots__ and are
//    platform-specific (fonts render differently on Windows/macOS/Linux), so
//    create and check them on the same OS / CI image.
//  - tests/e2e: behavior checks (click, type, assert text/attributes).
//    Color scheme doesn't affect behavior, so they run in the light projects only.
const E2E_ONLY_IN_LIGHT = '**/e2e/**'

export default defineConfig({
  testDir: './tests',
  snapshotPathTemplate:
    '{testDir}/{testFileDir}/__screenshots__/{projectName}/{arg}-{platform}{ext}',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  // In CI, 'github' adds failure annotations to the PR diff.
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  expect: {
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      // Tolerate a few pixels of anti-aliasing noise; real CSS changes are far bigger.
      maxDiffPixels: 20,
    },
  },
  use: {
    baseURL: `http://localhost:${PORT}`,
  },
  projects: [
    {
      name: 'desktop-light',
      use: { ...devices['Desktop Chrome'], colorScheme: 'light' },
    },
    {
      name: 'desktop-dark',
      use: { ...devices['Desktop Chrome'], colorScheme: 'dark' },
      testIgnore: E2E_ONLY_IN_LIGHT,
    },
    {
      name: 'mobile-light',
      use: { ...devices['Pixel 7'], colorScheme: 'light' },
    },
    {
      name: 'mobile-dark',
      use: { ...devices['Pixel 7'], colorScheme: 'dark' },
      testIgnore: E2E_ONLY_IN_LIGHT,
    },
  ],
  webServer: {
    command: `npm run dev -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})
