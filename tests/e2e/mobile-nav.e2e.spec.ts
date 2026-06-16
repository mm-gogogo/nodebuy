import { test, expect } from '@playwright/test'

test.describe('响应式导航', () => {
  test('桌面:链接常显,无汉堡', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')
    const nav = page.getByRole('navigation', { name: '主导航' })
    await expect(nav.getByRole('link', { name: '套餐' })).toBeVisible()
    await expect(page.getByRole('button', { name: '展开菜单' })).toBeHidden()
  })

  test('移动端:汉堡折叠,点击展开链接', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    const nav = page.getByRole('navigation', { name: '主导航' })
    // 折叠时链接不可见
    await expect(nav.getByRole('link', { name: '套餐' })).toBeHidden()
    const burger = page.getByRole('button', { name: '展开菜单' })
    await expect(burger).toBeVisible()
    await burger.click()
    // 展开后链接可见且可跳转
    await expect(nav.getByRole('link', { name: '套餐' })).toBeVisible()
    await nav.getByRole('link', { name: '套餐' }).click()
    await expect(page).toHaveURL(/\/plans/)
  })
})
