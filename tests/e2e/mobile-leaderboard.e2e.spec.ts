import { test, expect } from '@playwright/test'

test('窄屏排行只显当前排序指标列', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 })
  await page.goto('/benchmarks')
  // 默认排序 GB5 单核:该列可见,其它指标列(GB5 多核、CPU)隐藏
  await expect(page.getByRole('columnheader', { name: 'GB5 单核' })).toBeVisible()
  await expect(page.getByRole('columnheader', { name: 'GB5 多核' })).toBeHidden()
  await expect(page.getByRole('columnheader', { name: 'CPU' })).toBeHidden()
  // 切换到磁盘读:磁盘读列显示,GB5 单核隐藏
  await page.getByRole('combobox', { name: '按指标排序' }).selectOption('diskRead')
  await expect(page.getByRole('columnheader', { name: '磁盘读' })).toBeVisible()
  await expect(page.getByRole('columnheader', { name: 'GB5 单核' })).toBeHidden()
})

test('桌面排行显示全部列', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/benchmarks')
  for (const name of ['CPU', 'GB5 单核', 'GB5 多核', '磁盘读', '磁盘写']) {
    await expect(page.getByRole('columnheader', { name })).toBeVisible()
  }
})
