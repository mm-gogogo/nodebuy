import { test, expect } from '@playwright/test'

test.describe('套餐对比', () => {
  test('从套餐总览勾选并进入对比', async ({ page }) => {
    await page.goto('/plans')
    const toggles = page.locator('.cmp-toggle')
    await toggles.nth(0).click()
    await toggles.nth(1).click()

    const bar = page.getByRole('region', { name: '对比栏' })
    await expect(bar).toBeVisible()
    await expect(bar).toContainText('已选 2/4')

    await bar.getByRole('link', { name: /对比这些套餐/ }).click()
    await expect(page).toHaveURL(/\/compare\?plans=/)
    await expect(page.locator('table.compare-table')).toBeVisible()
    // 表头有两个套餐列 + “对比项”列
    await expect(page.locator('.compare-table thead th')).toHaveCount(3)
  })

  test('直接访问 /compare 渲染对比表', async ({ page }) => {
    await page.goto('/compare?plans=1,3')
    await expect(page.locator('table.compare-table')).toBeVisible()
    await expect(page.getByRole('row', { name: /服务商/ })).toBeVisible()
    await expect(page.getByRole('row', { name: /月付/ })).toBeVisible()
  })

  test('无 plans 参数显示空状态', async ({ page }) => {
    await page.goto('/compare')
    await expect(page.getByText(/还没有要对比的套餐/)).toBeVisible()
  })

  test('每项最优单元格高亮且带可访问标记', async ({ page }) => {
    await page.goto('/compare?plans=1,3')
    await expect(page.locator('table.compare-table')).toBeVisible()
    // 新增「等效月价」行
    await expect(page.getByRole('row', { name: /等效月价/ })).toBeVisible()
    // 两个规格各异的套餐,双方都应在某些项胜出 → 至少两个最优单元格
    const bestCells = page.locator('.compare-table td.is-best')
    expect(await bestCells.count()).toBeGreaterThanOrEqual(2)
    // 最优用绿色 ✓ 提供非颜色线索,并带 aria-label(不靠颜色单独传达)
    const mark = page.locator('.compare-table td.is-best .cmp-best').first()
    await expect(mark).toHaveAttribute('aria-label', '本项最优')
    await expect(mark).toContainText('✓')
  })
})
