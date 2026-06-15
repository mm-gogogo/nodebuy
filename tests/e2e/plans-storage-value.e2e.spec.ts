import { test, expect } from '@playwright/test'

test.describe('套餐每 G 硬盘性价比排序', () => {
  test('切换到硬盘性价比排序,单价改显示每 G 硬盘价并写入 URL', async ({ page }) => {
    await page.goto('/plans')
    // 默认显示每 G 内存价
    await expect(page.locator('.plan-browse .pb-unit').first()).toContainText('/G内存')

    await page.getByRole('combobox', { name: '排序方式' }).selectOption('value-storage')
    await expect.poll(() => new URL(page.url()).search).toContain('sort=value-storage')
    // 单价切换为每 G 硬盘价
    await expect(page.locator('.plan-browse .pb-unit').first()).toContainText('/G硬盘')

    // 刷新后保持
    await page.reload()
    await expect(page.getByRole('combobox', { name: '排序方式' })).toHaveValue('value-storage')
    await expect(page.locator('.plan-browse .pb-unit').first()).toContainText('/G硬盘')
  })
})
