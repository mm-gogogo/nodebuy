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
}

export interface ProviderFilterState {
  query: string
  cnOnly: boolean
  inStockOnly: boolean
}

export function filterProviders(items: ProviderItem[], state: ProviderFilterState): ProviderItem[] {
  const q = state.query.trim().toLowerCase()
  return items.filter((it) => {
    if (state.cnOnly && !it.cnOptimized) return false
    if (state.inStockOnly && it.planCount <= 0) return false
    if (q) {
      const hay = `${it.name} ${it.tagline ?? ''} ${it.headquarters ?? ''}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })
}
