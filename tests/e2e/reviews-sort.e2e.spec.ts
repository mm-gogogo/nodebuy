import { test, expect } from '@playwright/test'

const scoreNums = async (page: import('@playwright/test').Page) => {
  const texts = await page.locator('.review-row .rev-score').allInnerTexts()
  return texts.map((t) => parseFloat(t.replace(/[^0-9.]/g, '')))
}

test.describe('测评列表排序与评分', () => {
  test('列表展示综合评分', async ({ page }) => {
    await page.goto('/reviews')
    expect(await page.locator('.review-row .rev-score').count()).toBeGreaterThan(1)
    // 评分形如「综合 8.3」,落在 0–10
    const nums = await scoreNums(page)
    for (const n of nums) {
      expect(n).toBeGreaterThanOrEqual(0)
      expect(n).toBeLessThanOrEqual(10)
    }
  })

  test('按综合评分排序为降序', async ({ page }) => {
    await page.goto('/reviews')
    await page.getByRole('combobox', { name: '排序方式' }).selectOption('overall')
    const nums = await scoreNums(page)
    expect(nums.length).toBeGreaterThan(1)
    for (let i = 1; i < nums.length; i++) {
      expect(nums[i]).toBeLessThanOrEqual(nums[i - 1])
    }
  })

  test('排序写入 URL 并刷新保持', async ({ page }) => {
    await page.goto('/reviews')
    await page.getByRole('combobox', { name: '排序方式' }).selectOption('network')
    await expect.poll(() => new URL(page.url()).search).toContain('sort=network')
    await page.reload()
    await expect(page.getByRole('combobox', { name: '排序方式' })).toHaveValue('network')
  })
})
