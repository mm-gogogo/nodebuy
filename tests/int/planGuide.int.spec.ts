import { describe, it, expect } from 'vitest'
import { recommendPlans, CN_OPTIMIZED_ROUTES, useCaseKey, sortByUseCase } from '@/lib/planGuide'
import { pricePerCore, type PlanItem } from '@/lib/planBrowse'

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

describe('pricePerCore', () => {
  const mkc = (over: Partial<PlanItem>) => mk(over)
  it('每核等效月价,缺价/缺核为 Infinity', () => {
    expect(pricePerCore(mkc({ cpuCores: 4, priceMonthly: 8 }))).toBe(2)
    expect(pricePerCore(mkc({ cpuCores: 2, priceYearly: 120 }))).toBe(5) // 月10/2核
    expect(pricePerCore(mkc({ priceMonthly: 8 }))).toBe(Infinity) // 无核
    expect(pricePerCore(mkc({ cpuCores: 4 }))).toBe(Infinity) // 无价
  })
})

describe('按用途推荐(useCase)', () => {
  // P1=1 P2=2 P3=3 P4=4(均有货、无预算/内存限制)
  const cases: PlanItem[] = [
    mk({ id: 1, ramMB: 1024, storageGB: 20, trafficTB: 1, cpuCores: 1, priceMonthly: 10 }),
    mk({ id: 2, ramMB: 4096, storageGB: 40, trafficTB: 20, cpuCores: 4, priceMonthly: 8 }),
    mk({ id: 3, ramMB: 2048, storageGB: 2000, trafficTB: 5, cpuCores: 2, priceMonthly: 10 }),
    mk({ id: 4, ramMB: 1024, storageGB: 30, trafficTB: 0, cpuCores: 8, priceMonthly: 40 }), // 不限流量
  ]
  const none = { maxMonthly: null, minRamMB: 0, cnOptimized: false }
  const rec = (useCase: 'balanced' | 'traffic' | 'storage' | 'compute') =>
    recommendPlans(cases, { ...none, useCase }).map((p) => p.id)

  it('通用/建站:按每 G 内存', () => {
    // $/G内存:P2=2, P3=5, P1=10, P4=40
    expect(rec('balanced')).toEqual([2, 3, 1, 4])
  })
  it('存储/备份:按每 G 硬盘', () => {
    // $/G硬盘:P3=0.005, P2=0.2, P1=0.5, P4≈1.33
    expect(rec('storage')).toEqual([3, 2, 1, 4])
  })
  it('中转/流量:按每 TB,不限流量置顶', () => {
    // 不限(P4) → P2=0.4 → P3=2 → P1=10
    expect(rec('traffic')).toEqual([4, 2, 3, 1])
  })
  it('算力:按每核,并列稳定', () => {
    // $/核:P2=2, P3=5, P4=5, P1=10(P3、P4 并列,稳定保持 P3 在前)
    expect(rec('compute')).toEqual([2, 3, 4, 1])
  })
  it('缺省用途等同 balanced', () => {
    expect(recommendPlans(cases, none).map((p) => p.id)).toEqual([2, 3, 1, 4])
  })

  it('useCaseKey:不限流量记为 -Infinity(最优)', () => {
    expect(useCaseKey(cases[3], 'traffic')).toBe(-Infinity)
  })
  it('sortByUseCase 不修改入参', () => {
    const before = cases.map((p) => p.id)
    sortByUseCase(cases, 'storage')
    expect(cases.map((p) => p.id)).toEqual(before)
  })
})
