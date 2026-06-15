import type { ProviderSort } from './providerFilter'

// 服务商索引筛选状态 <-> URL query 的纯函数(服务端读取 + 客户端写入共用),
// 使筛选视图可分享/可收藏/刷新后保持。镜像 planQuery 的做法。

export interface ProviderQueryState {
  query: string
  cnOnly: boolean
  inStockOnly: boolean
  region: string
  payment: string
  sort: ProviderSort
}

const VALID_SORTS: ProviderSort[] = ['score', 'price', 'plans', 'name']

export const DEFAULT_PROVIDER_STATE: ProviderQueryState = {
  query: '',
  cnOnly: false,
  inStockOnly: false,
  region: 'all',
  payment: 'all',
  sort: 'score',
}

export function buildProviderQuery(s: ProviderQueryState): string {
  const p = new URLSearchParams()
  if (s.query.trim()) p.set('q', s.query.trim())
  if (s.cnOnly) p.set('cn', '1')
  if (s.inStockOnly) p.set('stock', '1')
  if (s.region && s.region !== 'all') p.set('region', s.region)
  if (s.payment && s.payment !== 'all') p.set('pay', s.payment)
  if (s.sort && s.sort !== 'score') p.set('sort', s.sort)
  return p.toString()
}

type RawParams = Record<string, string | string[] | undefined>
function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v
}

export function readProviderQuery(params: RawParams): ProviderQueryState {
  const sortRaw = first(params.sort) as ProviderSort | undefined
  return {
    query: first(params.q) ?? '',
    cnOnly: first(params.cn) === '1',
    inStockOnly: first(params.stock) === '1',
    region: first(params.region) ?? 'all',
    payment: first(params.pay) ?? 'all',
    sort: sortRaw && VALID_SORTS.includes(sortRaw) ? sortRaw : 'score',
  }
}
