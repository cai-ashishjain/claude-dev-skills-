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

// Hover/focus styles (e.g. `.counter:hover`, `#next-steps ul a:hover`) only show
// in these states, so a leak into them would otherwise go unnoticed.
// Desktop only: hover isn't a meaningful state on touch devices.
test.describe('interaction states', () => {
  test.skip(({ isMobile }) => isMobile, 'hover/focus checked on desktop only')

  test('component: counter button hover', async ({ page }) => {
    const button = page.getByRole('button', { name: 'Increment' })
    await button.hover()
    await expect(button).toHaveScreenshot('counter-button-hover.png')
  })

  test('component: counter button focus-visible', async ({ page }) => {
    const button = page.getByRole('button', { name: 'Decrement' })
    // Keyboard focus triggers :focus-visible (a mouse click would not).
    await page.keyboard.press('Tab')
    await expect(button).toBeFocused()
    // Include a margin so the outline (offset 2px outside the button) is captured.
    const box = await button.boundingBox()
    if (!box) throw new Error('Decrement button has no bounding box')
    await expect(page).toHaveScreenshot('counter-button-focus.png', {
      clip: { x: box.x - 8, y: box.y - 8, width: box.width + 16, height: box.height + 16 },
    })
  })

  test('component: docs link hover', async ({ page }) => {
    const link = page.locator('#docs a').first()
    await link.hover()
    // The hover style is a box-shadow that extends outside the link, so screenshot the list.
    await expect(page.locator('#docs ul')).toHaveScreenshot('docs-link-hover.png')
  })
})

// Interaction state: the counter after clicking, so styling of changed values is covered too.
test('component: counter after increment', async ({ page }) => {
  await page.getByRole('button', { name: 'Increment' }).click()
  await expect(page.locator('.counter-value')).toHaveText('Count is 1')
  // Move the pointer away so the hover style isn't captured; hover has its own test.
  await page.mouse.move(0, 0)
  await expect(page.locator('.counter-group')).toHaveScreenshot(
    'counter-incremented.png',
  )
})
