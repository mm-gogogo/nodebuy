import { test, expect } from '@playwright/test'

test('窄屏套餐行的入手按钮不被裁切', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 })
  await page.goto('/plans')
  const buy = page.locator('.plan-browse > li').first().getByRole('link', { name: '入手' })
  await expect(buy).toBeVisible()
  const box = await buy.boundingBox()
  expect(box).not.toBeNull()
  // 右边缘在视口内(未被裁切)
  expect((box!.x + box!.width)).toBeLessThanOrEqual(390)
})
