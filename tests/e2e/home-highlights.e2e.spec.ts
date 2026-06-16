import { test, expect } from '@playwright/test'

test.describe('首页性能之最', () => {
  test('展示之最卡片并可跳转', async ({ page }) => {
    await page.goto('/')
    const strip = page.getByRole('region', { name: '性能之最' })
    await expect(strip).toBeVisible()
    const cards = strip.locator('.hl-card')
    expect(await cards.count()).toBeGreaterThan(0)
    // 跑分最强 链到测评
    await expect(strip.getByRole('link', { name: /跑分最强/ })).toHaveAttribute('href', /^\/reviews\/.+/)
    // 最划算 链到价值排序的套餐总览
    await expect(strip.getByRole('link', { name: /最划算/ })).toHaveAttribute('href', /\/plans\?sort=value-ram/)
  })
})
