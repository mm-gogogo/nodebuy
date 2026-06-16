import { describe, it, expect } from 'vitest'
import { pricePerTbTraffic, valueRows, sortValue } from '@/lib/value'
import type { PlanItem } from '@/lib/planBrowse'

const mk = (over: Partial<PlanItem>): PlanItem => ({
  id: 0,
  name: 'p',
  providerName: 'Prov',
  providerSlug: 'prov',
  inStock: true,
  ...over,
})

// A=1 B=2 C=3 D=4 E=5 F=6
const items: PlanItem[] = [
  mk({ id: 1, name: 'A', ramMB: 1024, storageGB: 20, trafficTB: 1, priceMonthly: 10 }),
  mk({ id: 2, name: 'B', ramMB: 4096, storageGB: 40, trafficTB: 20, priceMonthly: 4 }),
  mk({ id: 3, name: 'C', ramMB: 2048, storageGB: 2000, trafficTB: 5, priceYearly: 120 }), // 月付=10
  mk({ id: 4, name: 'D', ramMB: 2048, storageGB: 50, trafficTB: 0, priceMonthly: 6 }), // 不限流量
  mk({ id: 5, name: 'E', ramMB: 1024, storageGB: 20, trafficTB: 1 }), // 无价
  mk({ id: 6, name: 'F', ramMB: 1024, storageGB: 20, priceMonthly: 8 }), // 无流量字段
]

const ids = (rows: { id: number }[]) => rows.map((r) => r.id)

describe('pricePerTbTraffic', () => {
  it('按等效月价 / 月流量 计算,缺价/缺流量/不限均为 null', () => {
    expect(pricePerTbTraffic(items[0])).toBe(10) // 10 / 1TB
    expect(pricePerTbTraffic(items[1])).toBeCloseTo(0.2) // 4 / 20TB
    expect(pricePerTbTraffic(items[2])).toBe(2) // 年付120→月10 / 5TB
    expect(pricePerTbTraffic(items[3])).toBeNull() // trafficTB=0 不限
    expect(pricePerTbTraffic(items[4])).toBeNull() // 无价
    expect(pricePerTbTraffic(items[5])).toBeNull() // 无流量字段
  })
})

describe('valueRows', () => {
  it('换算每维度单价,不限流量打标,缺数据为 null', () => {
    const rows = valueRows(items)
    const b = rows.find((r) => r.id === 2)!
    expect(b.monthly).toBe(4)
    expect(b.perGbRam).toBeCloseTo(1) // 4 / 4G
    expect(b.perGbStorage).toBeCloseTo(0.1) // 4 / 40G
    expect(b.perTbTraffic).toBeCloseTo(0.2)
    expect(b.unlimitedTraffic).toBe(false)

    const d = rows.find((r) => r.id === 4)!
    expect(d.unlimitedTraffic).toBe(true)
    expect(d.perTbTraffic).toBeNull()

    const e = rows.find((r) => r.id === 5)!
    expect(e.monthly).toBe(Infinity)
    expect(e.perGbRam).toBeNull()
    expect(e.perGbStorage).toBeNull()
  })
})

describe('sortValue', () => {
  const rows = valueRows(items)

  it('每 G 内存升序,无价的垫底', () => {
    // perGbRam: B1, D3, C5, F8, A10, E(null)
    expect(ids(sortValue(rows, 'ram'))).toEqual([2, 4, 3, 6, 1, 5])
  })

  it('每 G 硬盘升序,无价的垫底', () => {
    // perGbStorage: C0.005, B0.1, D0.12, F0.4, A0.5, E(null)
    expect(ids(sortValue(rows, 'storage'))).toEqual([3, 2, 4, 6, 1, 5])
  })

  it('每 TB 流量:不限置顶,其次按 $/TB 升序,缺流量/无价垫底且保持稳定序', () => {
    // D(不限)→ B0.2 → C2 → A10 → E、F(null,稳定保持 E 在 F 前)
    expect(ids(sortValue(rows, 'traffic'))).toEqual([4, 2, 3, 1, 5, 6])
  })

  it('不修改入参数组', () => {
    const before = ids(rows)
    sortValue(rows, 'ram')
    expect(ids(rows)).toEqual(before)
  })
})
