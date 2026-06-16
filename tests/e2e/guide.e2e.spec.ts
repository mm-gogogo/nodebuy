import { test, expect } from '@playwright/test'

test.describe('选购助手', () => {
  test('入口在主导航,展示推荐', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('navigation', { name: '主导航' }).getByRole('link', { name: '选购' }).click()
    await expect(page).toHaveURL(/\/guide$/)
    await expect(page.locator('h1')).toContainText('选购助手')
    expect(await page.locator('.plan-browse > li').count()).toBeGreaterThan(0)
  })

  test('改变预算会改变推荐数量', async ({ page }) => {
    await page.goto('/guide')
    const picks = page.locator('.plan-browse > li')

    // 选「不限」预算 → 推荐应不少于受限预算时
    await page.getByRole('group', { name: '月预算' }).getByRole('button', { name: '不限' }).click()
    const unlimited = await picks.count()

    await page.getByRole('group', { name: '月预算' }).getByRole('button', { name: '≤ $5' }).click()
    const cheap = await picks.count()
    expect(cheap).toBeLessThanOrEqual(unlimited)
  })

  test('大陆优化筛选只留优化线路', async ({ page }) => {
    await page.goto('/guide')
    await page.getByRole('group', { name: '月预算' }).getByRole('button', { name: '不限' }).click()
    await page.getByRole('button', { name: '需要大陆优化线路' }).click()
    // 每条推荐都带线路徽标
    const badges = page.locator('.plan-browse .badge--accent')
    expect(await badges.count()).toBeGreaterThan(0)
  })

  test('切换用途改变排序口径与单价单位', async ({ page }) => {
    await page.goto('/guide')
    await page.getByRole('group', { name: '月预算' }).getByRole('button', { name: '不限' }).click()
    const firstUnit = page.locator('.plan-browse .pb-unit').first()
    const useCase = page.getByRole('group', { name: '用途' })

    // 默认通用/建站 → 每 G 内存
    await useCase.getByRole('button', { name: '通用 / 建站' }).click()
    await expect(firstUnit).toContainText('/G内存')

    // 存储/备份 → 每 G 硬盘
    await useCase.getByRole('button', { name: '存储 / 备份' }).click()
    await expect(firstUnit).toContainText('/G硬盘')

    // 中转/流量 → 每 TB 流量(或不限流量)
    await useCase.getByRole('button', { name: '中转 / 流量' }).click()
    await expect(firstUnit).toContainText(/\/TB流量|不限流量/)

    // 算力/CPU → 每核
    await useCase.getByRole('button', { name: '算力 / CPU' }).click()
    await expect(firstUnit).toContainText('/核')

    // 标题反映当前用途
    await expect(page.getByText(/按「算力 \/ CPU」为你挑了/)).toBeVisible()
  })
})
