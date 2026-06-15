import { describe, it, expect } from 'vitest'
import { filterSortProviders, type ProviderItem } from '@/lib/providerFilter'

const mk = (over: Partial<ProviderItem>): ProviderItem => ({
  id: 0,
  name: 'P',
  slug: 'p',
  datacenterCount: 0,
  cnOptimized: false,
  planCount: 0,
  regions: [],
  paymentMethods: [],
  ...over,
})

const items: ProviderItem[] = [
  mk({ id: 1, name: 'BandwagonHost', tagline: 'CN2 GIA', headquarters: '加拿大', overallScore: 8.9, cnOptimized: true, planCount: 3, regions: ['na', 'apac'], startingMonthly: 16.99, paymentMethods: ['alipay', 'paypal', 'crypto'] }),
  mk({ id: 2, name: 'Hetzner', tagline: '欧洲', headquarters: '德国', overallScore: 8.1, cnOptimized: false, planCount: 2, regions: ['eu'], startingMonthly: 4.5, paymentMethods: ['card', 'paypal'] }),
  mk({ id: 3, name: 'CloudCone', tagline: '洛杉矶', headquarters: '美国', overallScore: 7.4, cnOptimized: false, planCount: 0, regions: ['na'], startingMonthly: null, paymentMethods: ['alipay'] }),
]

const base = { query: '', cnOnly: false, inStockOnly: false, region: 'all', payment: 'all', sort: 'score' as const }

describe('filterSortProviders · 过滤', () => {
  it('无筛选返回全部', () => {
    expect(filterSortProviders(items, base)).toHaveLength(3)
  })
  it('按名称搜索', () => {
    expect(filterSortProviders(items, { ...base, query: 'hetz' }).map((i) => i.id)).toEqual([2])
  })
  it('仅大陆优化', () => {
    expect(filterSortProviders(items, { ...base, cnOnly: true }).map((i) => i.id)).toEqual([1])
  })
  it('仅有套餐', () => {
    expect(filterSortProviders(items, { ...base, inStockOnly: true }).map((i) => i.id).sort()).toEqual([1, 2])
  })
  it('按机房地区筛选', () => {
    expect(filterSortProviders(items, { ...base, region: 'na' }).map((i) => i.id).sort()).toEqual([1, 3])
    expect(filterSortProviders(items, { ...base, region: 'eu' }).map((i) => i.id)).toEqual([2])
    expect(filterSortProviders(items, { ...base, region: 'apac' }).map((i) => i.id)).toEqual([1])
  })
  it('地区 + 大陆优化 叠加', () => {
    expect(filterSortProviders(items, { ...base, region: 'na', cnOnly: true }).map((i) => i.id)).toEqual([1])
  })
  it('按付款方式筛选', () => {
    expect(filterSortProviders(items, { ...base, payment: 'alipay' }).map((i) => i.id).sort()).toEqual([1, 3])
    expect(filterSortProviders(items, { ...base, payment: 'crypto' }).map((i) => i.id)).toEqual([1])
    expect(filterSortProviders(items, { ...base, payment: 'card' }).map((i) => i.id)).toEqual([2])
  })
  it('付款方式 + 地区 叠加', () => {
    expect(filterSortProviders(items, { ...base, payment: 'alipay', region: 'apac' }).map((i) => i.id)).toEqual([1])
  })
})

describe('filterSortProviders · 排序', () => {
  it('默认按评分降序', () => {
    expect(filterSortProviders(items, base).map((i) => i.id)).toEqual([1, 2, 3])
  })
  it('按套餐数降序', () => {
    expect(filterSortProviders(items, { ...base, sort: 'plans' }).map((i) => i.id)).toEqual([1, 2, 3])
  })
  it('按名称排序', () => {
    expect(filterSortProviders(items, { ...base, sort: 'name' }).map((i) => i.name)).toEqual([
      'BandwagonHost',
      'CloudCone',
      'Hetzner',
    ])
  })
  it('无评分排末尾', () => {
    const withNull = [...items, mk({ id: 4, name: 'NoScore', overallScore: null })]
    expect(filterSortProviders(withNull, base).map((i) => i.id).at(-1)).toBe(4)
  })
  it('按起步价升序,无价排末尾', () => {
    // 起步价:id2=4.5, id1=16.99, id3=null
    expect(filterSortProviders(items, { ...base, sort: 'price' }).map((i) => i.id)).toEqual([2, 1, 3])
  })
})
