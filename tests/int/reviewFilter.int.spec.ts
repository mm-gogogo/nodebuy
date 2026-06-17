import { describe, it, expect } from 'vitest'
import { filterReviews, overallScore, reviewProviderOptions, type ReviewItem } from '@/lib/reviewFilter'

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

describe('filterReviews 综合评分下限', () => {
  const scored: ReviewItem[] = [
    mk({ id: 1, scores: { performance: 8, network: 8, value: 8, support: 8 } }), // 8.0
    mk({ id: 2, scores: { performance: 9, network: 9, value: 9, support: 9 } }), // 9.0
    mk({ id: 3, scores: { performance: 6, network: 6, value: 6, support: 6 } }), // 6.0
    mk({ id: 4 }), // 无评分
  ]
  const b = { query: '', provider: 'all' }
  it('8 分+ 只留综合 >= 8,无评分被排除', () => {
    expect(filterReviews(scored, { ...b, minOverall: 8 }).map((r) => r.id)).toEqual([1, 2])
  })
  it('9 分+ 更严格', () => {
    expect(filterReviews(scored, { ...b, minOverall: 9 }).map((r) => r.id)).toEqual([2])
  })
  it('0 或未设表示不限', () => {
    expect(filterReviews(scored, { ...b, minOverall: 0 })).toHaveLength(4)
    expect(filterReviews(scored, b)).toHaveLength(4)
  })
})

describe('overallScore', () => {
  it('四项均值', () => {
    expect(overallScore({ performance: 8, network: 6, value: 7, support: 9 })).toBe(7.5)
  })
  it('只计有值项', () => {
    expect(overallScore({ performance: 8, network: null, value: 6, support: undefined })).toBe(7)
  })
  it('全缺/空为 null', () => {
    expect(overallScore({})).toBeNull()
    expect(overallScore(null)).toBeNull()
  })
})

describe('filterReviews 排序', () => {
  // A=1(Mar) B=2(Jan) C=3(Feb) D=4(无日期无分)
  const sortable: ReviewItem[] = [
    mk({ id: 1, publishedAt: '2026-03-01', scores: { performance: 9, network: 5, value: 6, support: 8 } }), // 综合7.0
    mk({ id: 2, publishedAt: '2026-01-01', scores: { performance: 6, network: 9, value: 5, support: 6 } }), // 综合6.5
    mk({ id: 3, publishedAt: '2026-02-01', scores: { performance: 7, network: 7, value: 9, support: 5 } }), // 综合7.0
    mk({ id: 4 }), // 无日期无分
  ]
  const run = (sort: 'newest' | 'overall' | 'performance' | 'network' | 'value') =>
    filterReviews(sortable, { query: '', provider: 'all', sort }).map((r) => r.id)

  it('默认/最新:发布日期降序,无日期垫底', () => {
    expect(run('newest')).toEqual([1, 3, 2, 4])
  })
  it('综合评分降序,并列稳定(1 在 3 前),无分垫底', () => {
    expect(run('overall')).toEqual([1, 3, 2, 4])
  })
  it('性能评分降序', () => {
    expect(run('performance')).toEqual([1, 3, 2, 4])
  })
  it('网络评分降序(明显区别于按日期)', () => {
    expect(run('network')).toEqual([2, 3, 1, 4])
  })
  it('性价比评分降序', () => {
    expect(run('value')).toEqual([3, 1, 2, 4])
  })
  it('不修改入参', () => {
    const before = sortable.map((r) => r.id)
    run('network')
    expect(sortable.map((r) => r.id)).toEqual(before)
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
