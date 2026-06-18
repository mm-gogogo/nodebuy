import { test, expect, Page } from '@playwright/test'
import { login } from '../helpers/login'
import { seedTestUser, cleanupTestUser, testUser } from '../helpers/seedUser'

test.describe('Admin Panel', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    await seedTestUser()

    const context = await browser.newContext()
    page = await context.newPage()

    await login({ page, user: testUser })
  })

  test.afterAll(async () => {
    await cleanupTestUser()
  })

  test('can navigate to dashboard', async () => {
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/admin$/)
    const dashboardArtifact = page.locator('span[title="Dashboard"]').first()
    await expect(dashboardArtifact).toBeVisible()
  })

  test('can navigate to list view', async () => {
    await page.goto('/admin/collections/users')
    await expect(page).toHaveURL(/\/admin\/collections\/users$/)
    const listViewArtifact = page.locator('h1', { hasText: 'Users' }).first()
    await expect(listViewArtifact).toBeVisible()
  })

  test('can navigate to edit view', async () => {
    await page.goto('/admin/collections/users/create')
    await expect(page).toHaveURL(/\/admin\/collections\/users\/[a-zA-Z0-9-_]+/)
    const editViewArtifact = page.locator('input[name="email"]')
    await expect(editViewArtifact).toBeVisible()
  })

  test('套餐列表展示「等效月价」只读计算列', async () => {
    await page.goto('/admin/collections/plans')
    // 列表数据异步加载 + 首次冷编译,给虚拟计算列表头充足等待
    await expect(page.getByRole('columnheader', { name: /等效月价/ })).toBeVisible({ timeout: 20000 })
  })

  test('测评列表展示「综合评分」只读计算列', async () => {
    await page.goto('/admin/collections/reviews')
    await expect(page.getByRole('columnheader', { name: /综合评分/ })).toBeVisible({ timeout: 20000 })
  })

  test('测评列表展示「数据完整度」只读计算列', async () => {
    await page.goto('/admin/collections/reviews')
    await expect(page.getByRole('columnheader', { name: /数据完整度/ })).toBeVisible({ timeout: 20000 })
  })

  test('优惠列表展示「状态」只读计算列', async () => {
    await page.goto('/admin/collections/deals')
    await expect(page.getByRole('columnheader', { name: /状态/ })).toBeVisible({ timeout: 20000 })
  })

  test('测评编辑表单按标签页分组(正文/评分/跑分与测速)', async () => {
    await page.goto('/admin/collections/reviews/create')
    // Payload 标签页渲染为 .tabs-field__tab-button(非 role=tab),标签文本唯一
    await expect(page.getByText('跑分与测速', { exact: true })).toBeVisible({ timeout: 20000 })
    // 默认在「正文」页:标题字段可见
    await expect(page.locator('#field-title')).toBeVisible()
    // 切到「评分」页:出现分项评分分组
    await page.getByText('评分', { exact: true }).click()
    await expect(page.getByText('分项评分')).toBeVisible()
  })
})
