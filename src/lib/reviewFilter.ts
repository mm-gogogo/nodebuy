import type { RowMetric } from './reviewMetrics'

// 测评列表的筛选 + 排序逻辑(纯函数,便于单测;客户端组件复用)。

export interface ReviewScores {
  performance?: number | null
  network?: number | null
  value?: number | null
  support?: number | null
}

export interface ReviewItem {
  id: number | string
  title: string
  slug: string
  providerName: string
  providerSlug: string
  publishedAt?: string | null
  metrics: RowMetric[]
  scores?: ReviewScores | null
}

export type ReviewSort = 'newest' | 'overall' | 'performance' | 'network' | 'value'

export const REVIEW_SORTS: ReviewSort[] = ['newest', 'overall', 'performance', 'network', 'value']

export interface ReviewFilterState {
  query: string
  provider: string // 'all' 或具体服务商 slug
  sort?: ReviewSort // 缺省按最新
}

// 综合评分:性能/网络/性价比/售后四项的均值,只计有值项;全缺为 null。
export function overallScore(scores: ReviewScores | null | undefined): number | null {
  if (!scores) return null
  const vals = [scores.performance, scores.network, scores.value, scores.support].filter(
    (n): n is number => typeof n === 'number' && Number.isFinite(n),
  )
  if (!vals.length) return null
  return vals.reduce((a, b) => a + b, 0) / vals.length
}

function scoreKey(r: ReviewItem, sort: ReviewSort): number | null {
  if (sort === 'overall') return overallScore(r.scores)
  if (sort === 'performance') return r.scores?.performance ?? null
  if (sort === 'network') return r.scores?.network ?? null
  if (sort === 'value') return r.scores?.value ?? null
  return null
}

// 缺值统一垫底的降序比较:a、b 任一为 null 都排到后面。
function descNullsLast(a: number | null, b: number | null): number {
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1
  return b - a
}

export function filterReviews(items: ReviewItem[], state: ReviewFilterState): ReviewItem[] {
  const q = state.query.trim().toLowerCase()
  const sort = state.sort ?? 'newest'
  const filtered = items.filter((r) => {
    if (state.provider !== 'all' && r.providerSlug !== state.provider) return false
    if (q) {
      const hay = `${r.title} ${r.providerName}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })

  const sorted = [...filtered]
  if (sort === 'newest') {
    sorted.sort((a, b) =>
      descNullsLast(
        a.publishedAt ? Date.parse(a.publishedAt) : null,
        b.publishedAt ? Date.parse(b.publishedAt) : null,
      ),
    )
  } else {
    sorted.sort((a, b) => descNullsLast(scoreKey(a, sort), scoreKey(b, sort)))
  }
  return sorted
}

// 从测评列表里抽出去重的服务商选项(按名称排序),给筛选下拉用。
export function reviewProviderOptions(items: ReviewItem[]): { slug: string; name: string }[] {
  const map = new Map<string, string>()
  for (const r of items) if (r.providerSlug) map.set(r.providerSlug, r.providerName)
  return [...map.entries()].map(([slug, name]) => ({ slug, name })).sort((a, b) => a.name.localeCompare(b.name))
}
