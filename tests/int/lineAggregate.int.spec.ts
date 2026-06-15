import { describe, it, expect } from 'vitest'
import { aggregateByRoute, type LinePlan } from '@/lib/lineAggregate'

const mk = (over: Partial<LinePlan>): LinePlan => ({
  providerName: 'P',
  providerSlug: 'p',
  inStock: true,
  ...over,
})

const plans: LinePlan[] = [
  mk({ route: 'cn2gia', providerName: '搬瓦工', providerSlug: 'bwh', priceMonthly: 16.99 }),
  mk({ route: 'cn2gia', providerName: '搬瓦工', providerSlug: 'bwh', priceYearly: 120 }), // 同服务商
  mk({ route: 'cn2gia', providerName: 'DMIT', providerSlug: 'dmit', priceMonthly: 12 }),
  mk({ route: 'direct', providerName: 'Hetzner', providerSlug: 'hetzner', priceMonthly: 4.5 }),
  mk({ route: null, providerName: 'X', providerSlug: 'x', priceMonthly: 1 }), // 无线路,跳过
]

describe('aggregateByRoute', () => {
  it('按线路分组,统计套餐数与去重后的服务商数', () => {
    const groups = aggregateByRoute(plans)
    const cn2 = groups.find((g) => g.route === 'cn2gia')!
    expect(cn2.planCount).toBe(3)
    expect(cn2.providerCount).toBe(2) // 搬瓦工去重
    expect(cn2.providers.map((p) => p.slug).sort()).toEqual(['bwh', 'dmit'])
  })

  it('cheapestMonthly 取等效月价最低(年付/12 参与比较)', () => {
    const cn2 = aggregateByRoute(plans).find((g) => g.route === 'cn2gia')!
    // 12, 16.99, 120/12=10 → 最低 10
    expect(cn2.cheapestMonthly).toBe(10)
  })

  it('无线路的套餐被跳过', () => {
    expect(aggregateByRoute(plans).some((g) => g.route === null || g.route === undefined)).toBe(false)
  })

  it('按套餐数降序排列', () => {
    const groups = aggregateByRoute(plans)
    expect(groups[0].route).toBe('cn2gia') // 3 个 > direct 的 1 个
    expect(groups.map((g) => g.planCount)).toEqual([...groups.map((g) => g.planCount)].sort((a, b) => b - a))
  })

  it('全部无价时 cheapestMonthly 为 null', () => {
    const g = aggregateByRoute([mk({ route: 'bgp' })])
    expect(g[0].cheapestMonthly).toBeNull()
  })

  it('空输入返回空', () => {
    expect(aggregateByRoute([])).toEqual([])
  })
})
