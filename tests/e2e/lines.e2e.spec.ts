import { test, expect } from '@playwright/test'

test.describe('线路总览', () => {
  test('入口在主导航,展示线路卡片', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('navigation', { name: '主导航' }).getByRole('link', { name: '线路' }).click()
    await expect(page).toHaveURL(/\/lines$/)
    await expect(page.locator('h1')).toContainText('线路总览')
    expect(await page.locator('.line-card').count()).toBeGreaterThan(0)
  })

  test('点击线路卡片进入套餐总览并预选该线路', async ({ page }) => {
    await page.goto('/lines')
    await page.locator('.line-card').first().click()
    await expect(page).toHaveURL(/\/plans\?route=/)
    // 该线路的筛选 chip 被预选
    await expect(page.locator('.route-tabs .filter-chip.is-on')).toHaveAttribute('aria-pressed', 'true')
    // 非「全部线路」
    await expect(page.locator('.route-tabs .filter-chip.is-on')).not.toHaveText('全部线路')
  })

  test('直接带 route 参数访问 /plans 预选对应线路', async ({ page }) => {
    await page.goto('/plans?route=cn2gia')
    const on = page.locator('.route-tabs .filter-chip.is-on')
    await expect(on).toHaveText('CN2 GIA')
  })
})
