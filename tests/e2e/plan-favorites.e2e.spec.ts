import { test, expect } from '@playwright/test'

test.describe('套餐收藏与对比', () => {
  test('在套餐总览收藏,收藏页汇总并可对比', async ({ page }) => {
    await page.goto('/plans')
    const rows = page.locator('.plan-browse > li')
    // 收藏前两个套餐
    await rows.nth(0).locator('.fav-btn--compact').click()
    await rows.nth(1).locator('.fav-btn--compact').click()
    // 收藏后图标变实心(aria-pressed=true)
    await expect(rows.nth(0).locator('.fav-btn--compact')).toHaveAttribute('aria-pressed', 'true')

    // 收藏页「收藏的套餐」区出现两条 + 对比入口
    await page.goto('/favorites')
    const favRows = page.locator('.fav-list.plan-browse > li')
    await expect(favRows).toHaveCount(2)

    const compareLink = page.getByRole('link', { name: /对比已收藏套餐/ })
    await expect(compareLink).toBeVisible()
    await compareLink.click()
    await expect(page).toHaveURL(/\/compare\?plans=/)
    await expect(page.locator('table.compare-table')).toBeVisible()
  })

  test('收藏跨页面持久,取消后从收藏页消失', async ({ page }) => {
    await page.goto('/plans')
    const first = page.locator('.plan-browse > li').first()
    await first.locator('.fav-btn--compact').click()

    // 刷新后仍为已收藏(localStorage 持久)
    await page.reload()
    await expect(page.locator('.plan-browse > li').first().locator('.fav-btn--compact')).toHaveAttribute(
      'aria-pressed',
      'true',
    )

    // 收藏页有一条,取消后变空状态
    await page.goto('/favorites')
    await expect(page.locator('.fav-list.plan-browse > li')).toHaveCount(1)
    await page.locator('.fav-list.plan-browse > li').first().locator('.fav-btn--compact').click()
    await expect(page.getByText('还没有收藏套餐')).toBeVisible()
  })

  test('服务商收藏不受套餐收藏影响(各自独立存储)', async ({ page }) => {
    await page.goto('/plans')
    await page.locator('.plan-browse > li').first().locator('.fav-btn--compact').click()
    // 套餐已收藏,但服务商收藏仍为空
    await page.goto('/favorites')
    await expect(page.locator('.fav-list.plan-browse > li')).toHaveCount(1)
    await expect(page.getByText('还没有收藏。去')).toBeVisible() // 服务商区空状态
  })
})
