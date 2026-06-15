import { test, expect } from '@playwright/test'

test.describe('套餐筛选可分享 URL', () => {
  test('筛选状态写入 URL,刷新后保持', async ({ page }) => {
    await page.goto('/plans')

    await page.getByRole('searchbox', { name: '搜索套餐' }).fill('vps')
    await page.getByRole('spinbutton', { name: '月价上限(美元)' }).fill('20')
    await page.getByRole('button', { name: '2G+' }).click()
    await page.getByRole('button', { name: '仅有货' }).click()

    // URL 反映筛选状态
    await expect.poll(() => new URL(page.url()).search).toContain('max=20')
    const search = new URL(page.url()).search
    expect(search).toContain('q=vps')
    expect(search).toContain('ram=2048')
    expect(search).toContain('stock=1')

    // 刷新后状态保持
    await page.reload()
    await expect(page.getByRole('searchbox', { name: '搜索套餐' })).toHaveValue('vps')
    await expect(page.getByRole('spinbutton', { name: '月价上限(美元)' })).toHaveValue('20')
    await expect(page.getByRole('button', { name: '2G+' })).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByRole('button', { name: '仅有货' })).toHaveAttribute('aria-pressed', 'true')
  })

  test('带参数的链接直接进入预筛选视图', async ({ page }) => {
    await page.goto('/plans?route=cn2gia&ram=2048&sort=ram-desc')
    await expect(page.locator('.route-tabs .filter-chip.is-on')).toHaveText('CN2 GIA')
    await expect(page.getByRole('button', { name: '2G+' })).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByRole('combobox', { name: '排序方式' })).toHaveValue('ram-desc')
  })
})
