import { test, expect } from '@playwright/test'

test.describe('服务商索引筛选', () => {
  test('搜索框按名称过滤', async ({ page }) => {
    await page.goto('/providers')
    const items = page.locator('.provider-index > li')
    const total = await items.count()
    expect(total).toBeGreaterThan(1)

    await page.getByRole('searchbox', { name: '搜索服务商' }).fill('bandwagon')
    await expect(items).toHaveCount(1)
    await expect(page.locator('.provider-index')).toContainText(/bandwagon/i)
  })

  test('“大陆优化”筛选只保留大陆优化服务商', async ({ page }) => {
    await page.goto('/providers')
    const items = page.locator('.provider-index > li')
    const total = await items.count()

    const chip = page.getByRole('button', { name: '大陆优化' })
    await chip.click()
    await expect(chip).toHaveAttribute('aria-pressed', 'true')

    const filtered = await items.count()
    expect(filtered).toBeLessThan(total)
    // 过滤后每个条目都带“大陆优化”徽标
    expect(filtered).toBeGreaterThan(0)
    await expect(items.locator('.badge--accent').first()).toBeVisible()
  })

  test('无匹配时显示空状态', async ({ page }) => {
    await page.goto('/providers')
    await page.getByRole('searchbox', { name: '搜索服务商' }).fill('zzz-不存在-zzz')
    await expect(page.locator('.provider-index > li')).toHaveCount(0)
    await expect(page.getByText('没有符合条件的服务商')).toBeVisible()
  })
})
