import { test, expect } from '@playwright/test'

const scoreNums = async (page: import('@playwright/test').Page) => {
  const texts = await page.locator('.review-row .rev-score').allInnerTexts()
  return texts.map((t) => parseFloat(t.replace(/[^0-9.]/g, '')))
}

test.describe('测评综合评分下限筛选', () => {
  test('选 8 分+ 只剩综合 ≥ 8,写入 URL 并刷新保持', async ({ page }) => {
    await page.goto('/reviews')
    const rows = page.locator('.review-row')
    const total = await rows.count()
    expect(total).toBeGreaterThan(1)

    const group = page.getByRole('group', { name: '按综合评分下限筛选' })
    await group.getByRole('button', { name: '8 分+' }).click()
    await expect.poll(() => new URL(page.url()).search).toContain('min=8')

    const filtered = await rows.count()
    expect(filtered).toBeGreaterThan(0)
    expect(filtered).toBeLessThanOrEqual(total)
    for (const n of await scoreNums(page)) expect(n).toBeGreaterThanOrEqual(8)

    await page.reload()
    await expect(group.getByRole('button', { name: '8 分+' })).toHaveAttribute('aria-pressed', 'true')
  })
})
