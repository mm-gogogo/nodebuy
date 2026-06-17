// 测评列表筛选状态 <-> URL query 的纯函数(服务端读取 + 客户端写入共用),
// 使筛选视图可分享/可收藏/刷新后保持。镜像 planQuery / providerQuery。

import { REVIEW_SORTS, type ReviewSort } from './reviewFilter'

export interface ReviewQueryState {
  query: string
  provider: string // 'all' 或服务商 slug
  sort: ReviewSort
  minOverall: number // 综合评分下限,0=不限
}

const VALID_MIN_OVERALL = [0, 7, 8, 9]

export const DEFAULT_REVIEW_STATE: ReviewQueryState = {
  query: '',
  provider: 'all',
  sort: 'newest',
  minOverall: 0,
}

function parseSort(v: string | undefined): ReviewSort {
  return (REVIEW_SORTS as string[]).includes(v ?? '') ? (v as ReviewSort) : 'newest'
}

export function buildReviewQuery(s: ReviewQueryState): string {
  const p = new URLSearchParams()
  if (s.query.trim()) p.set('q', s.query.trim())
  if (s.provider && s.provider !== 'all') p.set('provider', s.provider)
  if (s.sort && s.sort !== 'newest') p.set('sort', s.sort)
  if (s.minOverall) p.set('min', String(s.minOverall))
  return p.toString()
}

type RawParams = Record<string, string | string[] | undefined>
function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v
}

export function readReviewQuery(params: RawParams): ReviewQueryState {
  const min = Number(first(params.min))
  return {
    query: first(params.q) ?? '',
    provider: first(params.provider) ?? 'all',
    sort: parseSort(first(params.sort)),
    minOverall: VALID_MIN_OVERALL.includes(min) ? min : 0,
  }
}
