import { test, expect } from '@playwright/test'

test.describe('三网测速排行', () => {
  test('从页脚进入,展示排行', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('contentinfo').getByRole('link', { name: '三网测速' }).click()
    await expect(page).toHaveURL(/\/network$/)
    await expect(page.locator('h1')).toContainText('三网测速排行')
    expect(await page.locator('.bench-rank tbody tr').count()).toBeGreaterThan(0)
  })

  test('切换到延迟排序仍渲染', async ({ page }) => {
    await page.goto('/network')
    await page.getByRole('combobox', { name: '按指标排序' }).selectOption('latency')
    await expect(page.locator('.bench-rank tbody tr').first()).toBeVisible()
    await expect(page.locator('.bench-rank tbody tr').first().locator('.bench-title')).toHaveAttribute(
      'href',
      /^\/reviews\/.+/,
    )
  })

  test('与跑分排行互相交叉链接', async ({ page }) => {
    await page.goto('/network')
    await page.getByRole('link', { name: /跑分排行/ }).click()
    await expect(page).toHaveURL(/\/benchmarks$/)
    await page.getByRole('link', { name: /三网测速排行/ }).click()
    await expect(page).toHaveURL(/\/network$/)
  })
})
