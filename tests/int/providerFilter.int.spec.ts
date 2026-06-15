import { describe, it, expect } from 'vitest'
import { filterProviders, type ProviderItem } from '@/lib/providerFilter'

const items: ProviderItem[] = [
  { id: 1, name: 'BandwagonHost', slug: 'bwh', tagline: 'CN2 GIA 标杆', headquarters: '加拿大', overallScore: 8.9, datacenterCount: 8, cnOptimized: true, planCount: 3 },
  { id: 2, name: 'Hetzner', slug: 'hetzner', tagline: '欧洲高性价比', headquarters: '德国', overallScore: 8.1, datacenterCount: 2, cnOptimized: false, planCount: 2 },
  { id: 3, name: 'CloudCone', slug: 'cloudcone', tagline: '洛杉矶闪购', headquarters: '美国', overallScore: 7.4, datacenterCount: 1, cnOptimized: false, planCount: 0 },
]

const base = { query: '', cnOnly: false, inStockOnly: false }

describe('filterProviders', () => {
  it('无筛选返回全部', () => {
    expect(filterProviders(items, base)).toHaveLength(3)
  })

  it('按名称搜索（大小写不敏感）', () => {
    expect(filterProviders(items, { ...base, query: 'hetz' }).map((i) => i.id)).toEqual([2])
    expect(filterProviders(items, { ...base, query: 'HETZ' }).map((i) => i.id)).toEqual([2])
  })

  it('搜索匹配 tagline 与总部', () => {
    expect(filterProviders(items, { ...base, query: 'cn2' }).map((i) => i.id)).toEqual([1])
    expect(filterProviders(items, { ...base, query: '德国' }).map((i) => i.id)).toEqual([2])
  })

  it('仅大陆优化', () => {
    expect(filterProviders(items, { ...base, cnOnly: true }).map((i) => i.id)).toEqual([1])
  })

  it('仅有在售套餐（排除 planCount=0）', () => {
    expect(filterProviders(items, { ...base, inStockOnly: true }).map((i) => i.id)).toEqual([1, 2])
  })

  it('多条件叠加', () => {
    expect(filterProviders(items, { query: 'o', cnOnly: true, inStockOnly: true }).map((i) => i.id)).toEqual([1])
  })

  it('无匹配返回空', () => {
    expect(filterProviders(items, { ...base, query: '不存在的关键词' })).toEqual([])
  })

  it('空白搜索词被忽略', () => {
    expect(filterProviders(items, { ...base, query: '   ' })).toHaveLength(3)
  })
})
