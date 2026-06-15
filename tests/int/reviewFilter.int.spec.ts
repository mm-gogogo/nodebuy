import { describe, it, expect } from 'vitest'
import { filterReviews, reviewProviderOptions, type ReviewItem } from '@/lib/reviewFilter'

const mk = (over: Partial<ReviewItem>): ReviewItem => ({
  id: 0,
  title: 't',
  slug: 's',
  providerName: 'P',
  providerSlug: 'p',
  metrics: [],
  ...over,
})

const items: ReviewItem[] = [
  mk({ id: 1, title: '搬瓦工 CN2 GIA 实测', providerName: '搬瓦工', providerSlug: 'bwh' }),
  mk({ id: 2, title: 'Hetzner CX22 测评', providerName: 'Hetzner', providerSlug: 'hetzner' }),
  mk({ id: 3, title: '搬瓦工 HK 测评', providerName: '搬瓦工', providerSlug: 'bwh' }),
]

const base = { query: '', provider: 'all' }

describe('filterReviews', () => {
  it('无筛选返回全部', () => {
    expect(filterReviews(items, base)).toHaveLength(3)
  })
  it('按服务商筛选', () => {
    expect(filterReviews(items, { ...base, provider: 'bwh' }).map((r) => r.id)).toEqual([1, 3])
  })
  it('搜索匹配标题', () => {
    expect(filterReviews(items, { ...base, query: 'cx22' }).map((r) => r.id)).toEqual([2])
  })
  it('搜索匹配服务商名', () => {
    expect(filterReviews(items, { ...base, query: 'hetzner' }).map((r) => r.id)).toEqual([2])
  })
  it('搜索 + 服务商叠加', () => {
    expect(filterReviews(items, { query: 'hk', provider: 'bwh' }).map((r) => r.id)).toEqual([3])
  })
  it('无匹配返回空', () => {
    expect(filterReviews(items, { ...base, query: '不存在' })).toEqual([])
  })
})

describe('reviewProviderOptions', () => {
  it('去重(两条 bwh 合并为一)并按名称稳定排序', () => {
    const opts = reviewProviderOptions(items)
    expect(opts).toHaveLength(2)
    expect(opts.map((o) => o.slug).sort()).toEqual(['bwh', 'hetzner'])
    // 按 name 的 localeCompare 排序(确定性)
    expect(opts).toEqual([...opts].sort((a, b) => a.name.localeCompare(b.name)))
  })
})
