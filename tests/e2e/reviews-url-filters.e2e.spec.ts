import { test, expect } from '@playwright/test'

test.describe('测评筛选可分享 URL', () => {
  test('搜索写入 URL,刷新后保持', async ({ page }) => {
    await page.goto('/reviews')
    await page.getByRole('searchbox', { name: '搜索测评' }).fill('bandwagon')
    await expect.poll(() => new URL(page.url()).search).toContain('q=bandwagon')

    await page.reload()
    await expect(page.getByRole('searchbox', { name: '搜索测评' })).toHaveValue('bandwagon')
  })

  test('按服务商筛选写入 URL', async ({ page }) => {
    await page.goto('/reviews')
    const select = page.getByRole('combobox', { name: '按服务商筛选' })
    const value = await select.locator('option').nth(1).getAttribute('value')
    await select.selectOption(value!)
    await expect.poll(() => new URL(page.url()).search).toContain(`provider=${value}`)

    await page.reload()
    await expect(page.getByRole('combobox', { name: '按服务商筛选' })).toHaveValue(value!)
  })
})
