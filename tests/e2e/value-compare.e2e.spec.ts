import { test, expect } from '@playwright/test'

test.describe('性价比排行对比选择', () => {
  test('选中套餐 → 出现对比栏 → 进入对比页', async ({ page }) => {
    await page.goto('/value')
    const toggles = page.locator('.bench-rank .cmp-toggle')
    expect(await toggles.count()).toBeGreaterThan(1)
    await toggles.nth(0).click()
    await toggles.nth(1).click()

    const bar = page.getByRole('region', { name: '对比栏' })
    await expect(bar).toBeVisible()
    await expect(bar).toContainText('已选 2/4')

    await bar.getByRole('link', { name: /对比这些套餐/ }).click()
    await expect(page).toHaveURL(/\/compare\?plans=/)
    await expect(page.locator('table.compare-table')).toBeVisible()
  })

  test('清空可重置选择', async ({ page }) => {
    await page.goto('/value')
    await page.locator('.bench-rank .cmp-toggle').first().click()
    const bar = page.getByRole('region', { name: '对比栏' })
    await expect(bar).toBeVisible()
    await bar.getByRole('button', { name: '清空' }).click()
    await expect(bar).toBeHidden()
  })
})
