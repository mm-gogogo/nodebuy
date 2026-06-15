import { test, expect } from '@playwright/test'

test('从服务商索引直接勾选并对比', async ({ page }) => {
  await page.goto('/providers')
  const toggles = page.locator('.provider-index .cmp-toggle')
  await toggles.nth(0).click()
  await toggles.nth(1).click()

  const bar = page.getByRole('region', { name: '对比栏' })
  await expect(bar).toBeVisible()
  await expect(bar).toContainText('已选 2/4')

  await bar.getByRole('link', { name: /对比这些服务商/ }).click()
  await expect(page).toHaveURL(/\/compare-providers\?slugs=/)
  await expect(page.locator('table.compare-table')).toBeVisible()
  // 表头:对比项 + 两家服务商
  await expect(page.locator('.compare-table thead th')).toHaveCount(3)
})
