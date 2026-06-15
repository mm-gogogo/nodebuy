import { test, expect } from '@playwright/test'

test.describe('服务商索引 地区筛选与排序', () => {
  test('按机房地区筛选收窄结果', async ({ page }) => {
    await page.goto('/providers')
    const rows = page.locator('.provider-index > li')
    const total = await rows.count()
    expect(total).toBeGreaterThan(1)

    const regionGroup = page.getByRole('group', { name: '按机房地区筛选' })
    // 选第一个具体地区(非「全部地区」)
    const chip = regionGroup.getByRole('button').nth(1)
    await chip.click()
    await expect(chip).toHaveAttribute('aria-pressed', 'true')
    const filtered = await rows.count()
    expect(filtered).toBeGreaterThan(0)
    expect(filtered).toBeLessThanOrEqual(total)
  })

  test('切换排序方式仍有结果', async ({ page }) => {
    await page.goto('/providers')
    await page.getByRole('combobox', { name: '排序方式' }).selectOption('name')
    await expect(page.locator('.provider-index > li').first()).toBeVisible()
    await page.getByRole('combobox', { name: '排序方式' }).selectOption('plans')
    await expect(page.locator('.provider-index > li').first()).toBeVisible()
  })
})
