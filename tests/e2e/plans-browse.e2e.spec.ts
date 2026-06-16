import { test, expect } from '@playwright/test'

test.describe('套餐总览', () => {
  test('入口在主导航且页面可达', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('navigation', { name: '主导航' }).getByRole('link', { name: '套餐' }).click()
    await expect(page).toHaveURL(/\/plans$/)
    await expect(page.locator('h1').first()).toContainText('套餐总览')
  })

  test('搜索按服务商过滤', async ({ page }) => {
    await page.goto('/plans')
    const rows = page.locator('.plan-browse > li')
    const total = await rows.count()
    expect(total).toBeGreaterThan(1)

    await page.getByRole('searchbox', { name: '搜索套餐' }).fill('bandwagon')
    const filtered = await rows.count()
    expect(filtered).toBeGreaterThan(0)
    expect(filtered).toBeLessThan(total)
  })

  test('按线路筛选', async ({ page }) => {
    await page.goto('/plans')
    const rows = page.locator('.plan-browse > li')
    const total = await rows.count()

    // 限定在线路筛选组内,避免与套餐行的收藏按钮(aria-label 含套餐名)同名冲突
    const cn2 = page.getByRole('group', { name: '按线路筛选' }).getByRole('button', { name: 'CN2 GIA' })
    await cn2.click()
    await expect(cn2).toHaveAttribute('aria-pressed', 'true')
    const filtered = await rows.count()
    expect(filtered).toBeGreaterThan(0)
    expect(filtered).toBeLessThanOrEqual(total)
  })

  test('排序切换不报错且仍有结果', async ({ page }) => {
    await page.goto('/plans')
    await page.getByRole('combobox', { name: '排序方式' }).selectOption('ram-desc')
    await expect(page.locator('.plan-browse > li').first()).toBeVisible()
  })
})
