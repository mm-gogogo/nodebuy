import { test, expect } from '@playwright/test'

test.describe('性价比排行', () => {
  test('渲染排行,切换维度时高亮对应列', async ({ page }) => {
    await page.goto('/value')
    await expect(page.locator('h1')).toContainText('性价比排行')
    expect(await page.locator('.bench-rank tbody tr').count()).toBeGreaterThan(0)

    // 默认按每 G 内存排:该列高亮
    await expect(page.getByRole('columnheader', { name: '$/G 内存' })).toHaveClass(/is-sorted/)
    // 行内套餐名链到对应服务商页
    await expect(page.locator('.bench-rank tbody tr').first().locator('.bench-title')).toHaveAttribute(
      'href',
      /^\/providers\/.+/,
    )

    // 切到每 TB 流量:高亮转移到流量列
    await page.getByRole('combobox', { name: '按性价比维度排序' }).selectOption('traffic')
    await expect(page.getByRole('columnheader', { name: '$/TB 流量' })).toHaveClass(/is-sorted/)
    await expect(page.getByRole('columnheader', { name: '$/G 内存' })).not.toHaveClass(/is-sorted/)
  })

  test('窄屏只显当前排序的那一列指标,且整表不溢出视口', async ({ page }) => {
    const W = 390
    await page.setViewportSize({ width: W, height: 800 })
    await page.goto('/value')
    // 默认每 G 内存:该列可见,其它指标列隐藏
    const ramHead = page.getByRole('columnheader', { name: '$/G 内存' })
    await expect(ramHead).toBeVisible()
    await expect(page.getByRole('columnheader', { name: '$/G 硬盘' })).toBeHidden()
    await expect(page.getByRole('columnheader', { name: '$/TB 流量' })).toBeHidden()
    // 关键:保留的指标列要真正落在视口内(toBeVisible 不校验是否被横向挤出屏幕)
    const box = await ramHead.boundingBox()
    expect(box).not.toBeNull()
    expect(box!.x + box!.width).toBeLessThanOrEqual(W + 1)
    const tableBox = await page.locator('.bench-rank').boundingBox()
    expect(tableBox!.width).toBeLessThanOrEqual(W)
    // 切到流量:流量列显示,内存列隐藏
    await page.getByRole('combobox', { name: '按性价比维度排序' }).selectOption('traffic')
    await expect(page.getByRole('columnheader', { name: '$/TB 流量' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: '$/G 内存' })).toBeHidden()
  })

  test('与跑分/测速排行互相交叉链接,且套餐总览可进入', async ({ page }) => {
    await page.goto('/value')
    await page.getByRole('link', { name: /跑分排行/ }).click()
    await expect(page).toHaveURL(/\/benchmarks$/)

    await page.goto('/value')
    await page.getByRole('link', { name: /三网测速排行/ }).click()
    await expect(page).toHaveURL(/\/network$/)

    await page.goto('/plans')
    await page.getByRole('link', { name: /性价比排行/ }).click()
    await expect(page).toHaveURL(/\/value$/)
  })
})
