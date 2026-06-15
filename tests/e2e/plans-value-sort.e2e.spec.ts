import { test, expect } from '@playwright/test'

test.describe('套餐性价比排序', () => {
  test('每行展示每 G 内存单价', async ({ page }) => {
    await page.goto('/plans')
    const units = page.locator('.plan-browse .pb-unit')
    expect(await units.count()).toBeGreaterThan(0)
    await expect(units.first()).toContainText(/≈\$[\d.]+\/G内存/)
  })

  test('切换到性价比排序并写入 URL', async ({ page }) => {
    await page.goto('/plans')
    await page.getByRole('combobox', { name: '排序方式' }).selectOption('value-ram')
    await expect.poll(() => new URL(page.url()).search).toContain('sort=value-ram')

    // 刷新后排序保持
    await page.reload()
    await expect(page.getByRole('combobox', { name: '排序方式' })).toHaveValue('value-ram')
    await expect(page.locator('.plan-browse > li').first()).toBeVisible()
  })
})
