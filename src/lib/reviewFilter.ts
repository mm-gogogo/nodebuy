import type { RowMetric } from './reviewMetrics'

// 测评列表的筛选逻辑(纯函数,便于单测;客户端组件复用)。

export interface ReviewItem {
  id: number | string
  title: string
  slug: string
  providerName: string
  providerSlug: string
  publishedAt?: string | null
  metrics: RowMetric[]
}

export interface ReviewFilterState {
  query: string
  provider: string // 'all' 或具体服务商 slug
}

export function filterReviews(items: ReviewItem[], state: ReviewFilterState): ReviewItem[] {
  const q = state.query.trim().toLowerCase()
  return items.filter((r) => {
    if (state.provider !== 'all' && r.providerSlug !== state.provider) return false
    if (q) {
      const hay = `${r.title} ${r.providerName}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })
}

// 从测评列表里抽出去重的服务商选项(按名称排序),给筛选下拉用。
export function reviewProviderOptions(items: ReviewItem[]): { slug: string; name: string }[] {
  const map = new Map<string, string>()
  for (const r of items) if (r.providerSlug) map.set(r.providerSlug, r.providerName)
  return [...map.entries()].map(([slug, name]) => ({ slug, name })).sort((a, b) => a.name.localeCompare(b.name))
}
