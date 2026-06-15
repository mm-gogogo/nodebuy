import { test, expect } from '@playwright/test'

test.describe('测评列表筛选', () => {
  test('搜索按标题/服务商过滤', async ({ page }) => {
    await page.goto('/reviews')
    const rows = page.locator('.review-row')
    const total = await rows.count()
    expect(total).toBeGreaterThan(1)

    await page.getByRole('searchbox', { name: '搜索测评' }).fill('bandwagon')
    const filtered = await rows.count()
    expect(filtered).toBeGreaterThan(0)
    expect(filtered).toBeLessThan(total)
  })

  test('按服务商下拉筛选', async ({ page }) => {
    await page.goto('/reviews')
    const rows = page.locator('.review-row')
    const total = await rows.count()

    const select = page.getByRole('combobox', { name: '按服务商筛选' })
    // 选第一个具体服务商(非「全部服务商」)
    const value = await select.locator('option').nth(1).getAttribute('value')
    await select.selectOption(value!)
    const filtered = await rows.count()
    expect(filtered).toBeGreaterThan(0)
    expect(filtered).toBeLessThanOrEqual(total)
  })

  test('无匹配显示空状态', async ({ page }) => {
    await page.goto('/reviews')
    await page.getByRole('searchbox', { name: '搜索测评' }).fill('zzz-nomatch-zzz')
    await expect(page.getByText('没有符合条件的测评')).toBeVisible()
  })
})
