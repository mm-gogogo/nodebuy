import { test, expect } from '@playwright/test'

test.describe('收藏', () => {
  test('收藏服务商后出现在我的收藏,取消后消失', async ({ page }) => {
    await page.goto('/providers/bandwagonhost')
    const fav = page.getByRole('button', { name: /收藏 搬瓦工|收藏 BandwagonHost/ })
    await expect(fav).toHaveAttribute('aria-pressed', 'false')
    await fav.click()
    await expect(fav).toHaveAttribute('aria-pressed', 'true')

    // 收藏页应展示该服务商
    await page.goto('/favorites')
    await expect(page.locator('.fav-list')).toBeVisible()
    await expect(page.locator('.fav-list')).toContainText(/BandwagonHost|搬瓦工/)

    // 在收藏页取消收藏 → 列表清空
    await page.locator('.fav-list .fav-btn').first().click()
    await expect(page.getByText('还没有收藏')).toBeVisible()
  })

  test('无收藏时显示空状态', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/favorites')
    await page.evaluate(() => localStorage.removeItem('nodebuy:favorites'))
    await page.reload()
    await expect(page.getByText('还没有收藏')).toBeVisible()
  })
})
