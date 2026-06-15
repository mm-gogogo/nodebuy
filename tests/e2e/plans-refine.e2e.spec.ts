import { test, expect } from '@playwright/test'

test.describe('套餐预算与内存筛选', () => {
  test('月价上限收窄结果', async ({ page }) => {
    await page.goto('/plans')
    const rows = page.locator('.plan-browse > li')
    const total = await rows.count()
    expect(total).toBeGreaterThan(1)

    await page.getByRole('spinbutton', { name: '月价上限(美元)' }).fill('5')
    const filtered = await rows.count()
    expect(filtered).toBeLessThan(total)
  })

  test('内存下限 chip 收窄结果', async ({ page }) => {
    await page.goto('/plans')
    const rows = page.locator('.plan-browse > li')
    const total = await rows.count()

    const chip = page.getByRole('button', { name: '4G+' })
    await chip.click()
    await expect(chip).toHaveAttribute('aria-pressed', 'true')
    const filtered = await rows.count()
    expect(filtered).toBeGreaterThan(0)
    expect(filtered).toBeLessThan(total)
  })
})
