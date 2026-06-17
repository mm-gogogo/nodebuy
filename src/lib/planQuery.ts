import type { PlanSort } from './planBrowse'

// 套餐总览筛选状态 <-> URL query 的纯函数,服务端读取与客户端写入共用,
// 使筛选视图可分享、可收藏、刷新后保持。

export interface PlanQueryState {
  query: string
  route: string
  sort: PlanSort
  maxPrice: string // 保留字符串,空串=不限
  minRamMB: number
  inStockOnly: boolean
  storageType: string // 'all' 或 nvme/ssd/hdd
  region: string // 'all' 或 na/eu/apac/cn
}

const VALID_SORTS: PlanSort[] = ['price-asc', 'price-desc', 'ram-desc', 'value-ram', 'value-storage', 'value-traffic']
const VALID_RAM = [0, 1024, 2048, 4096, 8192]
const VALID_STORAGE = ['nvme', 'ssd', 'hdd']
const VALID_REGION = ['na', 'eu', 'apac', 'cn']

export const DEFAULT_PLAN_STATE: PlanQueryState = {
  query: '',
  route: 'all',
  sort: 'price-asc',
  maxPrice: '',
  minRamMB: 0,
  inStockOnly: false,
  storageType: 'all',
  region: 'all',
}

// 只写入非默认值,URL 尽量干净。
export function buildPlanQuery(s: PlanQueryState): string {
  const p = new URLSearchParams()
  if (s.query.trim()) p.set('q', s.query.trim())
  if (s.route && s.route !== 'all') p.set('route', s.route)
  if (s.sort && s.sort !== 'price-asc') p.set('sort', s.sort)
  if (s.maxPrice.trim()) p.set('max', s.maxPrice.trim())
  if (s.minRamMB) p.set('ram', String(s.minRamMB))
  if (s.inStockOnly) p.set('stock', '1')
  if (s.storageType && s.storageType !== 'all') p.set('disk', s.storageType)
  if (s.region && s.region !== 'all') p.set('region', s.region)
  return p.toString()
}

type RawParams = Record<string, string | string[] | undefined>

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v
}

export function readPlanQuery(params: RawParams): PlanQueryState {
  const sortRaw = first(params.sort) as PlanSort | undefined
  const ram = Number(first(params.ram))
  const disk = first(params.disk)
  const region = first(params.region)
  return {
    query: first(params.q) ?? '',
    route: first(params.route) ?? 'all',
    sort: sortRaw && VALID_SORTS.includes(sortRaw) ? sortRaw : 'price-asc',
    maxPrice: first(params.max) ?? '',
    minRamMB: VALID_RAM.includes(ram) ? ram : 0,
    inStockOnly: first(params.stock) === '1',
    storageType: disk && VALID_STORAGE.includes(disk) ? disk : 'all',
    region: region && VALID_REGION.includes(region) ? region : 'all',
  }
}
