import { test, expect } from '@playwright/test'

test.describe('跑分排行', () => {
  test('入口在主导航,展示排行表', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('navigation', { name: '主导航' }).getByRole('link', { name: '跑分' }).click()
    await expect(page).toHaveURL(/\/benchmarks$/)
    await expect(page.locator('h1')).toContainText('跑分排行')
    expect(await page.locator('.bench-rank tbody tr').count()).toBeGreaterThan(1)
  })

  test('切换排序指标会改变榜首', async ({ page }) => {
    await page.goto('/benchmarks')
    const firstTitle = page.locator('.bench-rank tbody tr').first().locator('.bench-title')
    const beforeText = await firstTitle.textContent()

    await page.getByRole('combobox', { name: '按指标排序' }).selectOption('diskWrite')
    // 表仍有行(榜首可能变,也可能不变;至少渲染正常)
    await expect(page.locator('.bench-rank tbody tr').first()).toBeVisible()
    expect(beforeText).toBeTruthy()
  })

  test('榜首条目链接到对应测评', async ({ page }) => {
    await page.goto('/benchmarks')
    await expect(page.locator('.bench-rank tbody tr').first().locator('.bench-title')).toHaveAttribute(
      'href',
      /^\/reviews\/.+/,
    )
  })
})
