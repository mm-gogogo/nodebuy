// 测评列表筛选状态 <-> URL query 的纯函数(服务端读取 + 客户端写入共用),
// 使筛选视图可分享/可收藏/刷新后保持。镜像 planQuery / providerQuery。

export interface ReviewQueryState {
  query: string
  provider: string // 'all' 或服务商 slug
}

export const DEFAULT_REVIEW_STATE: ReviewQueryState = {
  query: '',
  provider: 'all',
}

export function buildReviewQuery(s: ReviewQueryState): string {
  const p = new URLSearchParams()
  if (s.query.trim()) p.set('q', s.query.trim())
  if (s.provider && s.provider !== 'all') p.set('provider', s.provider)
  return p.toString()
}

type RawParams = Record<string, string | string[] | undefined>
function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v
}

export function readReviewQuery(params: RawParams): ReviewQueryState {
  return {
    query: first(params.q) ?? '',
    provider: first(params.provider) ?? 'all',
  }
}
