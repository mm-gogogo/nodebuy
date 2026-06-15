import { test, expect } from '@playwright/test'

test.describe('服务商筛选可分享 URL', () => {
  test('筛选状态写入 URL,刷新后保持', async ({ page }) => {
    await page.goto('/providers')

    await page.getByRole('button', { name: '大陆优化' }).click()
    await page.getByRole('combobox', { name: '排序方式' }).selectOption('price')

    await expect.poll(() => new URL(page.url()).search).toContain('cn=1')
    expect(new URL(page.url()).search).toContain('sort=price')

    await page.reload()
    await expect(page.getByRole('button', { name: '大陆优化' })).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByRole('combobox', { name: '排序方式' })).toHaveValue('price')
  })

  test('带参数的链接直接进入预筛选视图', async ({ page }) => {
    await page.goto('/providers?cn=1&sort=name')
    await expect(page.getByRole('button', { name: '大陆优化' })).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByRole('combobox', { name: '排序方式' })).toHaveValue('name')
  })
})
