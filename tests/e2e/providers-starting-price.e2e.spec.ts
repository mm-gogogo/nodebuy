import { test, expect } from '@playwright/test'

test.describe('服务商起步价', () => {
  test('索引展示起步价', async ({ page }) => {
    await page.goto('/providers')
    await expect(page.locator('.provider-index .facts').first()).toContainText(/起步 \$[\d.]+\/月/)
  })

  test('可按起步价排序', async ({ page }) => {
    await page.goto('/providers')
    await page.getByRole('combobox', { name: '排序方式' }).selectOption('price')
    await expect(page.getByRole('combobox', { name: '排序方式' })).toHaveValue('price')
    await expect(page.locator('.provider-index > li').first()).toBeVisible()
  })
})
