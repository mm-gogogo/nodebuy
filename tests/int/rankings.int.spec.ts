import { describe, it, expect } from 'vitest'
import { rankingLeader } from '@/lib/rankings'

describe('rankingLeader', () => {
  it('返回第 0 项(榜首)的服务商', () => {
    const r = {
      items: [
        { provider: { name: '搬瓦工', slug: 'bwh', brandColor: '#2b6cb0' } },
        { provider: { name: 'Hetzner', slug: 'hetzner' } },
      ],
    }
    expect(rankingLeader(r)).toEqual({ name: '搬瓦工', slug: 'bwh', brandColor: '#2b6cb0' })
  })

  it('无 brandColor 时补 null', () => {
    expect(rankingLeader({ items: [{ provider: { name: 'X', slug: 'x' } }] })).toEqual({
      name: 'X',
      slug: 'x',
      brandColor: null,
    })
  })

  it('关联未填充(仅 id)时返回 null', () => {
    expect(rankingLeader({ items: [{ provider: 7 }] })).toBeNull()
  })

  it('items 为空或缺失时返回 null', () => {
    expect(rankingLeader({ items: [] })).toBeNull()
    expect(rankingLeader({})).toBeNull()
    expect(rankingLeader({ items: null })).toBeNull()
  })

  it('首项无 provider 时返回 null', () => {
    expect(rankingLeader({ items: [{}] })).toBeNull()
  })
})
