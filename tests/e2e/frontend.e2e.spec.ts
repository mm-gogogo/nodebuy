import { test, expect } from '@playwright/test'

test.describe('Frontend', () => {
  test('首页展示站点标题与导航', async ({ page }) => {
    await page.goto('/')

    await expect(page).toHaveTitle(/NodeBuy/)
    await expect(page.locator('h1').first()).toContainText('服务器测评')

    const nav = page.getByRole('navigation', { name: '主导航' })
    await expect(nav.getByRole('link', { name: '榜单' })).toBeVisible()
    await expect(nav.getByRole('link', { name: '测评' })).toBeVisible()
    await expect(nav.getByRole('link', { name: '服务商' })).toBeVisible()
    await expect(nav.getByRole('link', { name: '优惠' })).toBeVisible()
  })

  test('可从导航进入服务商索引页', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('navigation', { name: '主导航' }).getByRole('link', { name: '服务商' }).click()

    await expect(page).toHaveURL(/\/providers$/)
    await expect(page.locator('h1').first()).toContainText('收录服务商')
  })

  test('robots.txt 与 sitemap.xml 可访问', async ({ page }) => {
    const robots = await page.request.get('/robots.txt')
    expect(robots.ok()).toBeTruthy()
    expect(await robots.text()).toContain('Sitemap:')

    const sitemap = await page.request.get('/sitemap.xml')
    expect(sitemap.ok()).toBeTruthy()
    expect(await sitemap.text()).toContain('<urlset')
  })

  test('feed.xml 返回 RSS', async ({ page }) => {
    const feed = await page.request.get('/feed.xml')
    expect(feed.ok()).toBeTruthy()
    expect(feed.headers()['content-type']).toContain('application/rss+xml')
    expect(await feed.text()).toContain('<rss')
  })
})
