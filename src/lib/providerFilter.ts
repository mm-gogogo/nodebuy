// 服务商索引的筛选逻辑（纯函数，便于单测；客户端组件复用）。

export interface ProviderItem {
  id: number
  name: string
  slug: string
  brandColor?: string | null
  tagline?: string | null
  headquarters?: string | null
  overallScore?: number | null
  datacenterCount: number
  cnOptimized: boolean
  planCount: number
  regions: string[]
  startingMonthly?: number | null // 最低等效月价(起步价),无则 null
}

export type ProviderSort = 'score' | 'name' | 'plans' | 'price'

export interface ProviderFilterState {
  query: string
  cnOnly: boolean
  inStockOnly: boolean
  region: string // 'all' 或具体区域值
  sort: ProviderSort
}

export function filterSortProviders(items: ProviderItem[], state: ProviderFilterState): ProviderItem[] {
  const q = state.query.trim().toLowerCase()
  const filtered = items.filter((it) => {
    if (state.cnOnly && !it.cnOptimized) return false
    if (state.inStockOnly && it.planCount <= 0) return false
    if (state.region !== 'all' && !it.regions.includes(state.region)) return false
    if (q) {
      const hay = `${it.name} ${it.tagline ?? ''} ${it.headquarters ?? ''}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })

  const sorted = [...filtered]
  if (state.sort === 'name') {
    sorted.sort((a, b) => a.name.localeCompare(b.name))
  } else if (state.sort === 'plans') {
    sorted.sort((a, b) => b.planCount - a.planCount)
  } else if (state.sort === 'price') {
    // 起步价 低→高,无价排末尾
    sorted.sort((a, b) => (a.startingMonthly ?? Infinity) - (b.startingMonthly ?? Infinity))
  } else {
    // score:综合评分降序,无评分排末尾
    sorted.sort((a, b) => (b.overallScore ?? -1) - (a.overallScore ?? -1))
  }
  return sorted
}
