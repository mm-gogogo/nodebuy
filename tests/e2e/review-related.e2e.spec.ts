import { test, expect } from '@playwright/test'

test('测评详情展示本服务商上榜榜单并可跳转', async ({ page }) => {
  await page.goto('/reviews/bandwagonhost-cn2-gia-e-dc6-review')

  const appearance = page.locator('.ranking-appearance').first()
  await expect(appearance).toBeVisible()
  await expect(appearance.locator('.rank-pos')).toContainText(/#\d+/)
  await expect(appearance).toHaveAttribute('href', /^\/rankings\/.+/)
})
