import { test, expect } from '@playwright/test'

test.describe('机房地区', () => {
  test('展示地区卡片,服务商徽标可跳转', async ({ page }) => {
    await page.goto('/regions')
    await expect(page.locator('h1')).toContainText('机房地区')
    const cards = page.locator('.line-card')
    expect(await cards.count()).toBeGreaterThan(0)

    // 某个地区卡片里的服务商徽标链接到服务商页
    const providerLink = cards.first().locator('.line-providers a').first()
    await expect(providerLink).toHaveAttribute('href', /^\/providers\/.+/)
  })

  test('与线路总览互相交叉链接', async ({ page }) => {
    await page.goto('/regions')
    await page.getByRole('link', { name: /按线路总览/ }).click()
    await expect(page).toHaveURL(/\/lines$/)

    await page.getByRole('link', { name: /按机房地区/ }).click()
    await expect(page).toHaveURL(/\/regions$/)
  })

  test('从页脚进入', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('contentinfo').getByRole('link', { name: '机房地区' }).click()
    await expect(page).toHaveURL(/\/regions$/)
  })
})
