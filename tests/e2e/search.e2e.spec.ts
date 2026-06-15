import { test, expect } from '@playwright/test'

test.describe('全站搜索', () => {
  test('从导航搜索框跳到结果页', async ({ page }) => {
    await page.goto('/')
    const box = page.getByRole('navigation', { name: '主导航' }).getByRole('searchbox', { name: '站内搜索' })
    await box.fill('bandwagon')
    await box.press('Enter')

    await expect(page).toHaveURL(/\/search\?q=bandwagon/)
    await expect(page.getByRole('heading', { name: '服务商' })).toBeVisible()
    await expect(page.getByRole('link', { name: /BandwagonHost/i }).first()).toBeVisible()
  })

  test('结果页表单可再次搜索', async ({ page }) => {
    await page.goto('/search?q=bandwagon')
    await expect(page.getByRole('status')).toContainText(/找到 \d+ 条结果/)

    const form = page.locator('form.search-page-form')
    await form.getByRole('searchbox', { name: '站内搜索' }).fill('cn2')
    await form.getByRole('button', { name: '搜索' }).click()
    await expect(page).toHaveURL(/\/search\?q=cn2/)
  })

  test('无匹配显示空状态', async ({ page }) => {
    await page.goto('/search?q=zzz-nomatch-zzz')
    await expect(page.getByText(/没有匹配/)).toBeVisible()
  })
})
