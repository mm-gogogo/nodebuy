// 跨服务商套餐浏览的筛选与排序逻辑(纯函数,便于单测;客户端组件复用)。

export interface PlanItem {
  id: number
  name: string
  providerName: string
  providerSlug: string
  brandColor?: string | null
  cpuCores?: number | null
  ramMB?: number | null
  storageGB?: number | null
  storageType?: string | null
  trafficTB?: number | null
  route?: string | null
  location?: string | null
  priceMonthly?: number | null
  priceYearly?: number | null
  inStock: boolean
}

export type PlanSort = 'price-asc' | 'price-desc' | 'ram-desc'

export interface PlanBrowseState {
  query: string
  route: string // 'all' 或具体线路值
  sort: PlanSort
  inStockOnly: boolean
}

// 归一为「等效月价」用于排序:优先月付,否则年付/12;都没有则视为无穷大(排末尾)。
export function effectiveMonthly(plan: PlanItem): number {
  if (plan.priceMonthly != null) return plan.priceMonthly
  if (plan.priceYearly != null) return plan.priceYearly / 12
  return Infinity
}

export function filterSortPlans(items: PlanItem[], state: PlanBrowseState): PlanItem[] {
  const q = state.query.trim().toLowerCase()
  const filtered = items.filter((p) => {
    if (state.inStockOnly && !p.inStock) return false
    if (state.route !== 'all' && p.route !== state.route) return false
    if (q) {
      const hay = `${p.name} ${p.providerName} ${p.location ?? ''}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })

  const sorted = [...filtered]
  if (state.sort === 'ram-desc') {
    sorted.sort((a, b) => (b.ramMB ?? 0) - (a.ramMB ?? 0))
  } else {
    const dir = state.sort === 'price-desc' ? -1 : 1
    sorted.sort((a, b) => {
      const ma = effectiveMonthly(a)
      const mb = effectiveMonthly(b)
      // 无价套餐(Infinity)无论升降都排在最后
      const aInf = !Number.isFinite(ma)
      const bInf = !Number.isFinite(mb)
      if (aInf && bInf) return 0
      if (aInf) return 1
      if (bInf) return -1
      return (ma - mb) * dir
    })
  }
  return sorted
}
