import { test, expect } from '@playwright/test'

test.describe('套餐:硬盘类型筛选 + 流量性价比排序', () => {
  test('按 NVMe 筛选,结果都是 NVMe,且写入 URL', async ({ page }) => {
    await page.goto('/plans')
    const rows = page.locator('.plan-browse > li')
    const total = await rows.count()

    await page.getByRole('group', { name: '按硬盘类型筛选' }).getByRole('button', { name: 'NVMe' }).click()
    await expect.poll(() => new URL(page.url()).search).toContain('disk=nvme')

    const filtered = await rows.count()
    expect(filtered).toBeGreaterThan(0)
    expect(filtered).toBeLessThan(total)
    // 每行规格里都标 NVMe,且不含其它盘型
    const specs = await page.locator('.plan-browse .pb-spec').allInnerTexts()
    for (const s of specs) {
      expect(s).toContain('NVMe')
      expect(s).not.toContain('HDD')
    }

    // 刷新后保持
    await page.reload()
    await expect(
      page.getByRole('group', { name: '按硬盘类型筛选' }).getByRole('button', { name: 'NVMe' }),
    ).toHaveAttribute('aria-pressed', 'true')
  })

  test('每 TB 流量排序:单价单位变为 /TB流量,写入 URL', async ({ page }) => {
    await page.goto('/plans')
    await page.getByRole('combobox', { name: '排序方式' }).selectOption('value-traffic')
    await expect.poll(() => new URL(page.url()).search).toContain('sort=value-traffic')
    await expect(page.locator('.plan-browse .pb-unit').first()).toContainText(/\/TB流量|不限流量/)

    await page.reload()
    await expect(page.getByRole('combobox', { name: '排序方式' })).toHaveValue('value-traffic')
  })
})
