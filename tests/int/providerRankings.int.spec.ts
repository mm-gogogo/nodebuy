import { describe, it, expect } from 'vitest'
import { findProviderRankings, type RankingLite } from '@/lib/providerRankings'

const rankings: RankingLite[] = [
  {
    slug: 'overall',
    title: '综合推荐',
    category: 'overall',
    items: [{ provider: 1 }, { provider: 2 }, { provider: 3 }],
  },
  {
    slug: 'value',
    title: '性价比',
    category: 'value',
    items: [{ provider: 2 }, { provider: 1 }],
  },
  {
    slug: 'cn',
    title: '大陆优化',
    category: 'cn-optimized',
    items: [{ provider: { id: 3 } }], // 关联以对象形式出现也要支持
  },
]

describe('findProviderRankings', () => {
  it('返回服务商出现的榜单及 1-based 名次', () => {
    const r = findProviderRankings(rankings, 1)
    expect(r).toEqual([
      { slug: 'overall', title: '综合推荐', category: 'overall', position: 1 },
      { slug: 'value', title: '性价比', category: 'value', position: 2 },
    ])
  })

  it('按名次升序排列', () => {
    // provider 2: overall 第 2 名、value 第 1 名 → value 在前
    expect(findProviderRankings(rankings, 2).map((a) => a.slug)).toEqual(['value', 'overall'])
  })

  it('支持关联以对象形式出现,并按名次排序', () => {
    // provider 3: cn 第 1 名、overall 第 3 名 → cn 在前
    expect(findProviderRankings(rankings, 3).map((a) => a.slug)).toEqual(['cn', 'overall'])
  })

  it('未上榜返回空数组', () => {
    expect(findProviderRankings(rankings, 999)).toEqual([])
  })

  it('items 缺失时安全跳过', () => {
    expect(findProviderRankings([{ slug: 'x', title: 'X', category: 'overall' }], 1)).toEqual([])
  })
})
