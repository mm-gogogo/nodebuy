import { describe, it, expect } from 'vitest'
import { filterSortPlans, effectiveMonthly, type PlanItem } from '@/lib/planBrowse'

const mk = (over: Partial<PlanItem>): PlanItem => ({
  id: 0,
  name: 'p',
  providerName: 'Prov',
  providerSlug: 'prov',
  inStock: true,
  ...over,
})

const items: PlanItem[] = [
  mk({ id: 1, name: 'A', providerName: 'BandwagonHost', ramMB: 1024, route: 'cn2gia', priceMonthly: 16.99, inStock: true }),
  mk({ id: 2, name: 'B', providerName: 'Hetzner', ramMB: 4096, route: 'direct', priceMonthly: 4.5, inStock: true }),
  mk({ id: 3, name: 'C', providerName: 'DMIT', ramMB: 2048, route: 'cn2gia', priceYearly: 120, inStock: false }),
  mk({ id: 4, name: 'D', providerName: 'Vultr', ramMB: 1024, route: 'bgp', inStock: true }), // 无价
]

const base = { query: '', route: 'all', sort: 'price-asc' as const, inStockOnly: false }

describe('effectiveMonthly', () => {
  it('优先月付,否则年付/12,都无则 Infinity', () => {
    expect(effectiveMonthly(mk({ priceMonthly: 5, priceYearly: 50 }))).toBe(5)
    expect(effectiveMonthly(mk({ priceYearly: 120 }))).toBe(10)
    expect(effectiveMonthly(mk({}))).toBe(Infinity)
  })
})

describe('filterSortPlans', () => {
  it('默认按等效月价升序,无价的排最后', () => {
    expect(filterSortPlans(items, base).map((p) => p.id)).toEqual([2, 3, 1, 4])
  })

  it('价格降序(无价仍排最后)', () => {
    expect(filterSortPlans(items, { ...base, sort: 'price-desc' }).map((p) => p.id)).toEqual([1, 3, 2, 4])
  })

  it('按内存降序', () => {
    expect(filterSortPlans(items, { ...base, sort: 'ram-desc' }).map((p) => p.id)).toEqual([2, 3, 1, 4])
  })

  it('按线路筛选', () => {
    expect(filterSortPlans(items, { ...base, route: 'cn2gia' }).map((p) => p.id).sort()).toEqual([1, 3])
  })

  it('仅有货排除缺货', () => {
    expect(filterSortPlans(items, { ...base, inStockOnly: true }).map((p) => p.id)).not.toContain(3)
  })

  it('搜索匹配套餐名与服务商名(大小写不敏感)', () => {
    expect(filterSortPlans(items, { ...base, query: 'hetz' }).map((p) => p.id)).toEqual([2])
    expect(filterSortPlans(items, { ...base, query: 'DMIT' }).map((p) => p.id)).toEqual([3])
  })

  it('多条件叠加', () => {
    expect(
      filterSortPlans(items, { query: '', route: 'cn2gia', sort: 'price-asc', inStockOnly: true }).map((p) => p.id),
    ).toEqual([1])
  })
})
