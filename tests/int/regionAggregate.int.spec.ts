import { describe, it, expect } from 'vitest'
import { aggregateByRegion, type RegionProviderInput } from '@/lib/regionAggregate'

const providers: RegionProviderInput[] = [
  {
    name: '搬瓦工', slug: 'bwh', brandColor: '#2b6cb0',
    datacenters: [
      { city: '洛杉矶', region: 'na', cnOptimized: true },
      { city: '弗里蒙特', region: 'na', cnOptimized: false }, // 同区域,服务商只算一次
      { city: '东京', region: 'apac', cnOptimized: true },
    ],
  },
  {
    name: 'DMIT', slug: 'dmit',
    datacenters: [{ city: '洛杉矶', region: 'na', cnOptimized: true }],
  },
  {
    name: 'Hetzner', slug: 'hetzner',
    datacenters: [{ city: '纽伦堡', region: 'eu', cnOptimized: false }],
  },
  {
    name: 'NoDC', slug: 'nodc', datacenters: [], // 无机房,不计入
  },
]

describe('aggregateByRegion', () => {
  it('按区域去重统计服务商数', () => {
    const na = aggregateByRegion(providers).find((g) => g.region === 'na')!
    expect(na.providerCount).toBe(2) // 搬瓦工(去重)+ DMIT
    expect(na.providers.map((p) => p.slug).sort()).toEqual(['bwh', 'dmit'])
  })

  it('统计该区域有大陆优化机房的服务商数', () => {
    const na = aggregateByRegion(providers).find((g) => g.region === 'na')!
    // 搬瓦工(洛杉矶 cnOpt)+ DMIT(洛杉矶 cnOpt) = 2
    expect(na.cnOptimizedCount).toBe(2)
  })

  it('城市去重', () => {
    const na = aggregateByRegion(providers).find((g) => g.region === 'na')!
    expect(na.cities.sort()).toEqual(['弗里蒙特', '洛杉矶'])
  })

  it('一个服务商可同时出现在多个区域', () => {
    const groups = aggregateByRegion(providers)
    const apac = groups.find((g) => g.region === 'apac')!
    expect(apac.providers.map((p) => p.slug)).toEqual(['bwh'])
    expect(apac.cnOptimizedCount).toBe(1)
  })

  it('无机房的服务商不计入任何区域', () => {
    const all = aggregateByRegion(providers).flatMap((g) => g.providers.map((p) => p.slug))
    expect(all).not.toContain('nodc')
  })

  it('按服务商数降序', () => {
    const counts = aggregateByRegion(providers).map((g) => g.providerCount)
    expect(counts).toEqual([...counts].sort((a, b) => b - a))
  })

  it('空输入返回空', () => {
    expect(aggregateByRegion([])).toEqual([])
  })
})
