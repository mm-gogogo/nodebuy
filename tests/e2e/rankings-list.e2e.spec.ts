import { test, expect } from '@playwright/test'

test('榜单列表展示每个榜单的榜首', async ({ page }) => {
  await page.goto('/rankings')
  const cards = page.locator('.cat-list > li')
  expect(await cards.count()).toBeGreaterThan(0)

  const leaders = page.locator('.cat-leader')
  expect(await leaders.count()).toBeGreaterThan(0)
  await expect(leaders.first()).toContainText('榜首')
})
