import { test, expect } from '@playwright/test'

test('服务商详情页「相关测评」显示综合评分', async ({ page }) => {
  await page.goto('/providers/bandwagonhost')
  const scores = page.locator('.review-row .rev-score')
  expect(await scores.count()).toBeGreaterThan(0)
  const n = parseFloat((await scores.first().innerText()).replace(/[^0-9.]/g, ''))
  expect(n).toBeGreaterThanOrEqual(0)
  expect(n).toBeLessThanOrEqual(10)
})
