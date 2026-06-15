import { test, expect } from '@playwright/test'

test('按付款方式筛选服务商', async ({ page }) => {
  await page.goto('/providers')
  const rows = page.locator('.provider-index > li')
  const total = await rows.count()
  expect(total).toBeGreaterThan(1)

  const select = page.getByRole('combobox', { name: '按付款方式筛选' })
  // 选第一个具体付款方式(非「不限付款」)
  const value = await select.locator('option').nth(1).getAttribute('value')
  await select.selectOption(value!)

  const filtered = await rows.count()
  expect(filtered).toBeGreaterThan(0)
  expect(filtered).toBeLessThanOrEqual(total)
})
