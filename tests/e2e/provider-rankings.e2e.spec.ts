import { test, expect } from '@playwright/test'

test('服务商详情展示上榜榜单并可跳转', async ({ page }) => {
  await page.goto('/providers/bandwagonhost')

  const appearance = page.locator('.ranking-appearance').first()
  await expect(appearance).toBeVisible()
  // 含名次(#N)
  await expect(appearance.locator('.rank-pos')).toContainText(/#\d+/)
  // 链接指向某个榜单
  await expect(appearance).toHaveAttribute('href', /^\/rankings\/.+/)
})
