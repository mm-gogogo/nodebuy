import { describe, it, expect } from 'vitest'
import { filterSortPlans, effectiveMonthly, pricePerGbRam, pricePerGbStorage, type PlanItem } from '@/lib/planBrowse'

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

  it('月价上限按等效月价过滤(无价被排除)', () => {
    // 等效月价:id2=4.5, id3=10, id1=16.99, id4=Infinity
    expect(filterSortPlans(items, { ...base, maxMonthly: 11 }).map((p) => p.id).sort()).toEqual([2, 3])
    expect(filterSortPlans(items, { ...base, maxMonthly: 5 }).map((p) => p.id)).toEqual([2])
    expect(filterSortPlans(items, { ...base, maxMonthly: 999 }).map((p) => p.id).sort()).toEqual([1, 2, 3]) // id4 无价仍排除
  })

  it('内存下限过滤', () => {
    // ramMB: id1=1024, id2=4096, id3=2048, id4=1024
    expect(filterSortPlans(items, { ...base, minRamMB: 2048 }).map((p) => p.id).sort()).toEqual([2, 3])
    expect(filterSortPlans(items, { ...base, minRamMB: 4096 }).map((p) => p.id)).toEqual([2])
  })

  it('月价 + 内存 + 线路 叠加', () => {
    expect(
      filterSortPlans(items, { ...base, route: 'cn2gia', maxMonthly: 20, minRamMB: 2048 }).map((p) => p.id),
    ).toEqual([3])
  })

  it('maxMonthly 为 null / minRamMB 为 0 表示不限', () => {
    expect(filterSortPlans(items, { ...base, maxMonthly: null, minRamMB: 0 })).toHaveLength(4)
  })

  it('每 G 内存最划算排序(value-ram),无价/无内存排末尾', () => {
    // 单价/GB:id1=16.99/1=16.99, id2=4.5/4=1.125, id3=10/2=5, id4=无价→Inf
    expect(filterSortPlans(items, { ...base, sort: 'value-ram' }).map((p) => p.id)).toEqual([2, 3, 1, 4])
  })
})

describe('pricePerGbRam', () => {
  it('等效月价 / GB 内存', () => {
    expect(pricePerGbRam(mk({ priceMonthly: 8, ramMB: 2048 }))).toBe(4) // 8 / 2G
    expect(pricePerGbRam(mk({ priceYearly: 120, ramMB: 1024 }))).toBe(10) // (120/12) / 1G
  })
  it('缺价或缺内存为 Infinity', () => {
    expect(pricePerGbRam(mk({ ramMB: 1024 }))).toBe(Infinity)
    expect(pricePerGbRam(mk({ priceMonthly: 5 }))).toBe(Infinity)
  })
})

describe('pricePerGbStorage', () => {
  it('等效月价 / GB 硬盘', () => {
    expect(pricePerGbStorage(mk({ priceMonthly: 10, storageGB: 100 }))).toBe(0.1)
    expect(pricePerGbStorage(mk({ priceYearly: 120, storageGB: 50 }))).toBe(0.2) // (120/12)/50
  })
  it('缺价或缺硬盘为 Infinity', () => {
    expect(pricePerGbStorage(mk({ storageGB: 100 }))).toBe(Infinity)
    expect(pricePerGbStorage(mk({ priceMonthly: 5 }))).toBe(Infinity)
  })
})

describe('value-storage 排序', () => {
  const storagePlans: PlanItem[] = [
    mk({ id: 10, priceMonthly: 10, storageGB: 100 }), // 0.1/G
    mk({ id: 11, priceMonthly: 5, storageGB: 20 }), // 0.25/G
    mk({ id: 12, priceMonthly: 8, storageGB: 1000 }), // 0.008/G,最划算
    mk({ id: 13, priceMonthly: 3 }), // 无硬盘 → Inf
  ]
  it('每 G 硬盘最划算升序,缺硬盘排末尾', () => {
    expect(filterSortPlans(storagePlans, { ...base, sort: 'value-storage' }).map((p) => p.id)).toEqual([12, 10, 11, 13])
  })
})

describe('硬盘类型筛选(storageType)', () => {
  const disks: PlanItem[] = [
    mk({ id: 20, storageType: 'nvme', priceMonthly: 10 }),
    mk({ id: 21, storageType: 'ssd', priceMonthly: 8 }),
    mk({ id: 22, storageType: 'hdd', priceMonthly: 6 }),
    mk({ id: 23, storageType: 'nvme', priceMonthly: 4 }),
  ]
  it('只保留指定硬盘类型', () => {
    expect(filterSortPlans(disks, { ...base, storageType: 'nvme' }).map((p) => p.id).sort()).toEqual([20, 23])
    expect(filterSortPlans(disks, { ...base, storageType: 'hdd' }).map((p) => p.id)).toEqual([22])
  })
  it('all / 未填 表示不限', () => {
    expect(filterSortPlans(disks, { ...base, storageType: 'all' })).toHaveLength(4)
    expect(filterSortPlans(disks, base)).toHaveLength(4)
  })
})

describe('value-traffic 排序', () => {
  const tplans: PlanItem[] = [
    mk({ id: 30, trafficTB: 1, priceMonthly: 10 }), // 10/TB
    mk({ id: 31, trafficTB: 20, priceMonthly: 4 }), // 0.2/TB
    mk({ id: 32, trafficTB: 0, priceMonthly: 6 }), // 不限流量 → 最优置顶
    mk({ id: 33, priceMonthly: 8 }), // 无流量 → 垫底
    mk({ id: 34, trafficTB: 5 }), // 无价 → 垫底
  ]
  it('不限流量置顶,其次 $/TB 升序,缺流量/缺价垫底且稳定', () => {
    expect(filterSortPlans(tplans, { ...base, sort: 'value-traffic' }).map((p) => p.id)).toEqual([32, 31, 30, 33, 34])
  })
})

describe('机房区域筛选(region)', () => {
  const geo: PlanItem[] = [
    mk({ id: 40, location: '洛杉矶 DC6', priceMonthly: 5 }), // na
    mk({ id: 41, location: '东京', priceMonthly: 5 }), // apac
    mk({ id: 42, location: '法尔肯施泰因', priceMonthly: 5 }), // eu
    mk({ id: 43, location: '上海', priceMonthly: 5 }), // cn
    mk({ id: 44, location: '香港 MEGA', priceMonthly: 5 }), // apac
    mk({ id: 45, location: '火星', priceMonthly: 5 }), // 未命中
  ]
  it('按区域归类筛选', () => {
    expect(filterSortPlans(geo, { ...base, region: 'na' }).map((p) => p.id)).toEqual([40])
    expect(filterSortPlans(geo, { ...base, region: 'apac' }).map((p) => p.id).sort()).toEqual([41, 44])
    expect(filterSortPlans(geo, { ...base, region: 'eu' }).map((p) => p.id)).toEqual([42])
    expect(filterSortPlans(geo, { ...base, region: 'cn' }).map((p) => p.id)).toEqual([43])
  })
  it('all / 未填 表示不限(含未命中区域的)', () => {
    expect(filterSortPlans(geo, { ...base, region: 'all' })).toHaveLength(6)
    expect(filterSortPlans(geo, base)).toHaveLength(6)
  })
})
