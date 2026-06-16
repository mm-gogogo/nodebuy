import { describe, it, expect } from 'vitest'
import {
  parsePlanIds,
  comparePlanRows,
  bestCols,
  compareMonthly,
  MAX_COMPARE,
  type ComparePlan,
} from '@/lib/compare'

describe('parsePlanIds', () => {
  it('解析逗号分隔的 id', () => {
    expect(parsePlanIds('1,2,3')).toEqual([1, 2, 3])
  })
  it('去重并保序', () => {
    expect(parsePlanIds('2,2,1,2')).toEqual([2, 1])
  })
  it('过滤非法/非正整数', () => {
    expect(parsePlanIds('1,abc,0,-3,2.5,4')).toEqual([1, 4])
  })
  it('限量到 MAX_COMPARE', () => {
    expect(parsePlanIds('1,2,3,4,5,6')).toEqual([1, 2, 3, 4])
    expect(parsePlanIds('1,2,3,4,5,6').length).toBe(MAX_COMPARE)
  })
  it('空/缺省返回空数组', () => {
    expect(parsePlanIds('')).toEqual([])
    expect(parsePlanIds(null)).toEqual([])
    expect(parsePlanIds(undefined)).toEqual([])
  })
  it('自定义上限', () => {
    expect(parsePlanIds('1,2,3', 2)).toEqual([1, 2])
  })
})

describe('comparePlanRows', () => {
  const plans: ComparePlan[] = [
    {
      id: 1, name: 'A', providerName: '搬瓦工', providerSlug: 'bwh',
      cpuCores: 2, ramMB: 2048, storageGB: 40, storageType: 'nvme', trafficTB: 1,
      route: 'cn2gia', location: '洛杉矶', priceMonthly: 16.99, priceYearly: 169.99, inStock: true,
    },
    {
      id: 2, name: 'B', providerName: 'Hetzner', providerSlug: 'hetzner',
      cpuCores: 1, ramMB: 4096, storageGB: 80, storageType: null, trafficTB: 0,
      route: null, location: null, priceMonthly: 4.5, priceYearly: null, inStock: false,
    },
  ]

  it('生成属性 × 套餐的行', () => {
    const rows = comparePlanRows(plans)
    const get = (label: string) => rows.find((r) => r.label === label)?.values
    expect(get('服务商')).toEqual(['搬瓦工', 'Hetzner'])
    expect(get('vCPU')).toEqual(['2 核', '1 核'])
    expect(get('内存')).toEqual(['2G', '4G'])
    expect(get('硬盘')).toEqual(['40G NVMe', '80G NVMe']) // null storageType → 默认 nvme
    expect(get('流量')).toEqual(['1T/月', '不限'])
    expect(get('线路')).toEqual(['CN2 GIA', '—'])
    expect(get('机房')).toEqual(['洛杉矶', '—'])
    expect(get('等效月价')).toEqual(['$16.99/月', '$4.50/月'])
    expect(get('月付')).toEqual(['$16.99', '$4.5'])
    expect(get('年付')).toEqual(['$169.99', '—'])
    expect(get('库存')).toEqual(['有货', '缺货'])
  })

  it('标记每项最优列(A=0,B=1)', () => {
    const rows = comparePlanRows(plans)
    const best = (label: string) => rows.find((r) => r.label === label)?.best
    expect(best('vCPU')).toEqual([0]) // 2 核 > 1 核
    expect(best('内存')).toEqual([1]) // 4G > 2G
    expect(best('硬盘')).toEqual([1]) // 80G > 40G
    expect(best('流量')).toEqual([1]) // 不限 > 1T
    expect(best('等效月价')).toEqual([1]) // $4.50 < $16.99
    // 非量化行不打标
    expect(best('服务商')).toBeUndefined()
    expect(best('机房')).toBeUndefined()
  })

  it('单个套餐时不打最优标(无可比对象)', () => {
    const rows = comparePlanRows([plans[0]])
    for (const r of rows) expect(r.best ?? []).toEqual([])
  })

  it('每行 values 数量与套餐数一致', () => {
    for (const row of comparePlanRows(plans)) {
      expect(row.values).toHaveLength(plans.length)
    }
  })
})

describe('bestCols', () => {
  it('higherBetter 取最大列', () => {
    expect(bestCols([2, 1], true)).toEqual([0])
    expect(bestCols([1, 2, 2], true)).toEqual([1, 2]) // 并列最优都标
  })
  it('lowerBetter 取最小列', () => {
    expect(bestCols([10, 4, 4], false)).toEqual([1, 2])
  })
  it('全员相等 → 不标(无信号)', () => {
    expect(bestCols([5, 5], true)).toEqual([])
  })
  it('可比项不足两个 → 不标', () => {
    expect(bestCols([3, null], true)).toEqual([])
    expect(bestCols([null, null], true)).toEqual([])
    expect(bestCols([], true)).toEqual([])
  })
  it('忽略缺失项,在其余里取最优', () => {
    expect(bestCols([null, 7, 3], true)).toEqual([1])
  })
})

describe('compareMonthly', () => {
  const mk = (over: Partial<ComparePlan>): ComparePlan => ({
    id: 0, name: 'p', providerName: 'P', providerSlug: 'p', inStock: true, ...over,
  })
  it('优先月付,否则年付/12,都无则 null', () => {
    expect(compareMonthly(mk({ priceMonthly: 5, priceYearly: 50 }))).toBe(5)
    expect(compareMonthly(mk({ priceYearly: 120 }))).toBe(10)
    expect(compareMonthly(mk({}))).toBeNull()
  })
})
