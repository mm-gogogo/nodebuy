import { test, expect } from '@playwright/test'

// 校验详情页输出有效的 BreadcrumbList 结构化数据。
const pages = [
  { name: '测评详情', path: '/reviews/bandwagonhost-cn2-gia-e-dc6-review' },
  { name: '榜单详情', path: '/rankings/best-value' },
  { name: '服务商详情', path: '/providers/bandwagonhost' },
]

for (const { name, path } of pages) {
  test(`${name} 含有效 BreadcrumbList JSON-LD`, async ({ page }) => {
    await page.goto(path)
    const scripts = await page.locator('script[type="application/ld+json"]').allTextContents()
    const breadcrumbs = scripts
      .map((s) => JSON.parse(s))
      .filter((d) => d['@type'] === 'BreadcrumbList')

    expect(breadcrumbs).toHaveLength(1)
    const items = breadcrumbs[0].itemListElement
    expect(items[0].name).toBe('首页')
    expect(items.at(-1).item).toContain(path)
    // position 连续递增
    expect(items.map((i: { position: number }) => i.position)).toEqual(
      items.map((_: unknown, i: number) => i + 1),
    )

    // 可见面包屑导航与 JSON-LD 对应
    const nav = page.getByRole('navigation', { name: '面包屑' })
    await expect(nav).toBeVisible()
    await expect(nav.getByRole('link', { name: '首页' })).toHaveAttribute('href', '/')
    await expect(nav.locator('[aria-current="page"]')).toBeVisible()
  })
}
