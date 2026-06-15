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

export type PlanSort = 'price-asc' | 'price-desc' | 'ram-desc' | 'value-ram'

export interface PlanBrowseState {
  query: string
  route: string // 'all' 或具体线路值
  sort: PlanSort
  inStockOnly: boolean
  maxMonthly?: number | null // 等效月价上限($/月),null/未填=不限
  minRamMB?: number // 内存下限(MB),0/未填=不限
}

// 归一为「等效月价」用于排序:优先月付,否则年付/12;都没有则视为无穷大(排末尾)。
export function effectiveMonthly(plan: PlanItem): number {
  if (plan.priceMonthly != null) return plan.priceMonthly
  if (plan.priceYearly != null) return plan.priceYearly / 12
  return Infinity
}

// 每 GB 内存的等效月价($/G内存),越小越划算;缺价或缺内存视为无穷大(排末尾)。
export function pricePerGbRam(plan: PlanItem): number {
  const m = effectiveMonthly(plan)
  if (!Number.isFinite(m) || !plan.ramMB) return Infinity
  return m / (plan.ramMB / 1024)
}

export function filterSortPlans(items: PlanItem[], state: PlanBrowseState): PlanItem[] {
  const q = state.query.trim().toLowerCase()
  const filtered = items.filter((p) => {
    if (state.inStockOnly && !p.inStock) return false
    if (state.route !== 'all' && p.route !== state.route) return false
    if (state.maxMonthly != null && effectiveMonthly(p) > state.maxMonthly) return false
    if (state.minRamMB && (p.ramMB ?? 0) < state.minRamMB) return false
    if (q) {
      const hay = `${p.name} ${p.providerName} ${p.location ?? ''}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })

  const sorted = [...filtered]
  if (state.sort === 'ram-desc') {
    sorted.sort((a, b) => (b.ramMB ?? 0) - (a.ramMB ?? 0))
  } else if (state.sort === 'value-ram') {
    // 每 G 内存最划算:升序,无穷大(缺价/缺内存)排最后
    sorted.sort((a, b) => {
      const va = pricePerGbRam(a)
      const vb = pricePerGbRam(b)
      const aInf = !Number.isFinite(va)
      const bInf = !Number.isFinite(vb)
      if (aInf && bInf) return 0
      if (aInf) return 1
      if (bInf) return -1
      return va - vb
    })
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
