import { test, expect } from '@playwright/test'

test.describe('服务商对比', () => {
  test('收藏两家后从收藏页进入对比', async ({ page }) => {
    // 收藏两家服务商
    for (const slug of ['bandwagonhost', 'dmit']) {
      await page.goto(`/providers/${slug}`)
      await page.locator('.fav-btn').first().click()
    }

    await page.goto('/favorites')
    const compareLink = page.getByRole('link', { name: /对比已收藏服务商/ })
    await expect(compareLink).toBeVisible()
    await compareLink.click()

    await expect(page).toHaveURL(/\/compare-providers\?slugs=/)
    await expect(page.locator('table.compare-table')).toBeVisible()
    await expect(page.getByRole('row', { name: /综合评分/ })).toBeVisible()
    // 两家服务商两列 + 对比项列
    await expect(page.locator('.compare-table thead th')).toHaveCount(3)
  })

  test('直接访问 /compare-providers 渲染对比表', async ({ page }) => {
    await page.goto('/compare-providers?slugs=bandwagonhost,dmit')
    await expect(page.locator('table.compare-table')).toBeVisible()
    await expect(page.getByRole('row', { name: /大陆优化/ })).toBeVisible()
  })

  test('无 slugs 显示空状态', async ({ page }) => {
    await page.goto('/compare-providers')
    await expect(page.getByText(/还没有要对比的服务商/)).toBeVisible()
  })
})
