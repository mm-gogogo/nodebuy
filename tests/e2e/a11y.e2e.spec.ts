import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

// 扫描核心页面的 WCAG 2.0/2.1 A & AA 违规。
const pages: Array<{ name: string; path: string }> = [
  { name: '首页', path: '/' },
  { name: '榜单列表', path: '/rankings' },
  { name: '榜单详情', path: '/rankings/best-value' },
  { name: '测评列表', path: '/reviews' },
  { name: '测评详情', path: '/reviews/bandwagonhost-cn2-gia-e-dc6-review' },
  { name: '套餐总览', path: '/plans' },
  { name: '线路总览', path: '/lines' },
  { name: '机房地区', path: '/regions' },
  { name: '套餐对比', path: '/compare?plans=1,3' },
  { name: '服务商对比', path: '/compare-providers?slugs=bandwagonhost,dmit' },
  { name: '搜索结果', path: '/search?q=bandwagon' },
  { name: '我的收藏', path: '/favorites' },
  { name: '服务商索引', path: '/providers' },
  { name: '服务商详情', path: '/providers/bandwagonhost' },
  { name: '优惠速递', path: '/deals' },
]

for (const { name, path } of pages) {
  test(`${name} 无 a11y 违规`, async ({ page }) => {
    await page.goto(path)
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    if (results.violations.length) {
      console.log(`\n[a11y] ${name} (${path}) 违规:`)
      for (const v of results.violations) {
        console.log(`  - ${v.id} (${v.impact}): ${v.help} ×${v.nodes.length}`)
        console.log(`    ${v.nodes[0]?.target?.join(' ')}`)
      }
    }
    expect(results.violations).toEqual([])
  })
}
