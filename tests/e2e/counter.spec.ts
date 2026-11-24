import { test, expect } from '@playwright/test'

// Behavior checks for the counter. Buttons are found by accessible name, so
// these also fail if the aria-labels are lost.
test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('starts at zero', async ({ page }) => {
  await expect(page.locator('.counter-value')).toHaveText('Count is 0')
})

test('increment adds one per click', async ({ page }) => {
  const increment = page.getByRole('button', { name: 'Increment' })
  for (let i = 0; i < 3; i++) await increment.click()
  await expect(page.locator('.counter-value')).toHaveText('Count is 3')
})

test('decrement subtracts one per click', async ({ page }) => {
  const increment = page.getByRole('button', { name: 'Increment' })
  const decrement = page.getByRole('button', { name: 'Decrement' })
  for (let i = 0; i < 3; i++) await increment.click()
  for (let i = 0; i < 2; i++) await decrement.click()
  await expect(page.locator('.counter-value')).toHaveText('Count is 1')
})

// Records current behavior: the count is allowed to go negative.
test('decrement can go below zero', async ({ page }) => {
  await page.getByRole('button', { name: 'Decrement' }).click()
  await expect(page.locator('.counter-value')).toHaveText('Count is -1')
})

test('buttons work from the keyboard', async ({ page }) => {
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Decrement' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('.counter-value')).toHaveText('Count is -1')

  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Increment' })).toBeFocused()
  await page.keyboard.press('Space')
  await page.keyboard.press('Space')
  await expect(page.locator('.counter-value')).toHaveText('Count is 1')
})
