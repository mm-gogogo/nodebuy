import { test, expect } from '@playwright/test'

test('测评列表行内展示关键指标', async ({ page }) => {
  await page.goto('/reviews')
  const rows = page.locator('.review-row')
  expect(await rows.count()).toBeGreaterThan(0)

  // 至少有一行展示 GB5 或 网络 指标
  const metrics = page.locator('.review-row .rev-metric')
  expect(await metrics.count()).toBeGreaterThan(0)
  await expect(metrics.first()).toContainText(/GB5|网络/)
})
