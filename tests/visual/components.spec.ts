import { test, expect } from '@playwright/test'

// One screenshot per component, so a failure names the component that changed.
// To add a component: add a { name, selector } entry. Use `mask` in
// toHaveScreenshot for content that changes between runs (dates, avatars, ads).
const components = [
  { name: 'hero', selector: '#center .hero' },
  { name: 'intro', selector: '#center > div:has(> h1)' },
  { name: 'counter', selector: '.counter-group' },
  { name: 'docs', selector: '#docs' },
  { name: 'social', selector: '#social' },
]

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  // Wait for images and web fonts so screenshots don't capture a half-loaded state.
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => document.fonts.ready)
})

for (const { name, selector } of components) {
  test(`component: ${name}`, async ({ page }) => {
    const el = page.locator(selector)
    await expect(el).toBeVisible()
    await expect(el).toHaveScreenshot(`${name}.png`)
  })
}

// Interaction state: the counter after clicking, so styling of changed values is covered too.
test('component: counter after increment', async ({ page }) => {
  await page.getByRole('button', { name: 'Increment' }).click()
  await expect(page.locator('.counter-value')).toHaveText('Count is 1')
  await expect(page.locator('.counter-group')).toHaveScreenshot(
    'counter-incremented.png',
  )
})
