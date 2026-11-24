import { test, expect } from '@playwright/test'

// Checks each link's destination and that it opens in a new tab.
// Does not visit the external sites, so it stays fast and works offline.
const links = [
  { section: '#docs', name: 'Explore Vite', href: 'https://vite.dev/' },
  { section: '#docs', name: 'Learn more', href: 'https://react.dev/' },
  { section: '#social', name: 'GitHub', href: 'https://github.com/vitejs/vite' },
  { section: '#social', name: 'Discord', href: 'https://chat.vite.dev/' },
  { section: '#social', name: 'X.com', href: 'https://x.com/vite_js' },
  { section: '#social', name: 'Bluesky', href: 'https://bsky.app/profile/vite.dev' },
]

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

for (const { section, name, href } of links) {
  test(`link "${name}" points to ${href} in a new tab`, async ({ page }) => {
    const link = page.locator(section).getByRole('link', { name, exact: true })
    await expect(link).toHaveAttribute('href', href)
    await expect(link).toHaveAttribute('target', '_blank')
  })
}

test('no unexpected links were added or removed', async ({ page }) => {
  await expect(page.locator('#next-steps a')).toHaveCount(links.length)
})
