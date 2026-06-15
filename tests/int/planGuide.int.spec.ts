import { describe, it, expect } from 'vitest'
import { recommendPlans, CN_OPTIMIZED_ROUTES } from '@/lib/planGuide'
import type { PlanItem } from '@/lib/planBrowse'

const mk = (over: Partial<PlanItem>): PlanItem => ({
  id: 0,
  name: 'p',
  providerName: 'Prov',
  providerSlug: 'prov',
  inStock: true,
  ...over,
})

const items: PlanItem[] = [
  mk({ id: 1, ramMB: 1024, priceMonthly: 16.99, route: 'cn2gia' }), // 16.99/G
  mk({ id: 2, ramMB: 4096, priceMonthly: 4.5, route: 'direct' }), // 1.125/G,最划算
  mk({ id: 3, ramMB: 2048, priceMonthly: 10, route: 'cmin2' }), // 5/G,大陆优化
  mk({ id: 4, ramMB: 2048, priceMonthly: 6, route: 'cn2gt', inStock: false }), // 缺货
  mk({ id: 5, ramMB: 8192, priceMonthly: 30, route: 'bgp' }), // 超预算
]

const base = { maxMonthly: null, minRamMB: 0, cnOptimized: false }

describe('recommendPlans', () => {
  it('默认按每 G 内存最划算排序,只推有货', () => {
    // 单价/GB:id2=1.125, id5=30/8=3.75, id3=5, id1=16.99(id4 缺货排除)
    const r = recommendPlans(items, base)
    expect(r.map((p) => p.id)).toEqual([2, 5, 3, 1])
  })

  it('预算上限过滤', () => {
    expect(recommendPlans(items, { ...base, maxMonthly: 10 }).map((p) => p.id)).toEqual([2, 3])
  })

  it('内存下限过滤', () => {
    expect(recommendPlans(items, { ...base, minRamMB: 4096 }).map((p) => p.id)).toEqual([2, 5])
  })

  it('大陆优化只保留优化线路', () => {
    const r = recommendPlans(items, { ...base, cnOptimized: true })
    expect(r.every((p) => p.route && CN_OPTIMIZED_ROUTES.includes(p.route))).toBe(true)
    expect(r.map((p) => p.id)).toEqual([3, 1]) // cmin2, cn2gia(cn2gt 缺货被排除)
  })

  it('多条件叠加', () => {
    // 预算 ≤12 + 大陆优化 + 有货 → cmin2(id3)
    expect(recommendPlans(items, { maxMonthly: 12, minRamMB: 0, cnOptimized: true }).map((p) => p.id)).toEqual([3])
  })

  it('topN 截断', () => {
    expect(recommendPlans(items, base, 2).map((p) => p.id)).toEqual([2, 5])
  })

  it('无匹配返回空', () => {
    expect(recommendPlans(items, { ...base, maxMonthly: 1 })).toEqual([])
  })
})
