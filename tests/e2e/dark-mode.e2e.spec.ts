import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('深色主题', () => {
  test('切换主题并持久化', async ({ page }) => {
    await page.goto('/')
    const html = page.locator('html')
    await expect(html).toHaveAttribute('data-theme', 'light')

    await page.getByRole('button', { name: /切换到深色主题/ }).click()
    await expect(html).toHaveAttribute('data-theme', 'dark')

    // 刷新后保持深色(localStorage + FOUC 脚本)
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    await expect(page.getByRole('button', { name: /切换到浅色主题/ })).toBeVisible()
  })
})

// 深色主题下的对比度门禁:覆盖多种组件的代表性页面
const darkPages = [
  { name: '首页', path: '/' },
  { name: '套餐总览', path: '/plans' },
  { name: '服务商索引', path: '/providers' },
  { name: '测评详情', path: '/reviews/bandwagonhost-cn2-gia-e-dc6-review' },
  { name: '套餐对比', path: '/compare?plans=1,3' },
  { name: '优惠速递', path: '/deals' },
]

for (const { name, path } of darkPages) {
  test(`深色 · ${name} 无对比度等 a11y 违规`, async ({ page }) => {
    // 让 FOUC 脚本在首帧就置为深色
    await page.addInitScript(() => localStorage.setItem('nodebuy:theme', 'dark'))
    await page.goto(path)
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    if (results.violations.length) {
      for (const v of results.violations) {
        console.log(`[dark a11y] ${name}: ${v.id} (${v.impact}) ×${v.nodes.length} → ${v.nodes[0]?.target?.join(' ')}`)
      }
    }
    expect(results.violations).toEqual([])
  })
}
