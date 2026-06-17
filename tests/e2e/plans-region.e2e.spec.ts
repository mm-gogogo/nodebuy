import { test, expect } from '@playwright/test'

test.describe('套餐机房区域筛选', () => {
  test('按区域筛选,结果集变化,写入 URL 并刷新保持', async ({ page }) => {
    await page.goto('/plans')
    const rows = page.locator('.plan-browse > li')
    const total = await rows.count()
    expect(total).toBeGreaterThan(1)

    const group = page.getByRole('group', { name: '按机房区域筛选' })
    await group.getByRole('button', { name: '北美' }).click()
    await expect.poll(() => new URL(page.url()).search).toContain('region=na')
    const na = await rows.count()
    expect(na).toBeGreaterThan(0)
    expect(na).toBeLessThan(total)

    // 切到亚太,结果集应不同(东京/香港/新加坡等)
    await group.getByRole('button', { name: '亚太' }).click()
    await expect.poll(() => new URL(page.url()).search).toContain('region=apac')
    expect(await rows.count()).toBeGreaterThan(0)

    await page.reload()
    await expect(group.getByRole('button', { name: '亚太' })).toHaveAttribute('aria-pressed', 'true')
  })
})
