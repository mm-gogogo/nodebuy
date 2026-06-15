import { describe, it, expect } from 'vitest'
import { parsePlanIds, comparePlanRows, MAX_COMPARE, type ComparePlan } from '@/lib/compare'

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
    expect(get('月付')).toEqual(['$16.99', '$4.5'])
    expect(get('年付')).toEqual(['$169.99', '—'])
    expect(get('库存')).toEqual(['有货', '缺货'])
  })

  it('每行 values 数量与套餐数一致', () => {
    for (const row of comparePlanRows(plans)) {
      expect(row.values).toHaveLength(plans.length)
    }
  })
})
