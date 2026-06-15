// 按线路聚合套餐(纯函数,便于单测)。给「线路总览」页提供每条线路的概览数据。

export interface LinePlan {
  route?: string | null
  providerName: string
  providerSlug: string
  brandColor?: string | null
  priceMonthly?: number | null
  priceYearly?: number | null
  inStock: boolean
}

export interface LineProvider {
  name: string
  slug: string
  brandColor?: string | null
}

export interface LineGroup {
  route: string
  planCount: number
  providerCount: number
  cheapestMonthly: number | null // 等效月价最低,无价则 null
  providers: LineProvider[]
}

function effMonthly(p: LinePlan): number {
  if (p.priceMonthly != null) return p.priceMonthly
  if (p.priceYearly != null) return p.priceYearly / 12
  return Infinity
}

export function aggregateByRoute(plans: LinePlan[]): LineGroup[] {
  const groups = new Map<string, { plans: LinePlan[]; providers: Map<string, LineProvider> }>()
  for (const p of plans) {
    if (!p.route) continue
    let g = groups.get(p.route)
    if (!g) {
      g = { plans: [], providers: new Map() }
      groups.set(p.route, g)
    }
    g.plans.push(p)
    if (!g.providers.has(p.providerSlug)) {
      g.providers.set(p.providerSlug, { name: p.providerName, slug: p.providerSlug, brandColor: p.brandColor })
    }
  }

  const out: LineGroup[] = []
  for (const [route, g] of groups) {
    const prices = g.plans.map(effMonthly).filter((n) => Number.isFinite(n))
    out.push({
      route,
      planCount: g.plans.length,
      providerCount: g.providers.size,
      cheapestMonthly: prices.length ? Math.min(...prices) : null,
      providers: [...g.providers.values()],
    })
  }
  // 套餐数多的线路排前面,数量相同按线路值排序保证稳定
  out.sort((a, b) => b.planCount - a.planCount || a.route.localeCompare(b.route))
  return out
}
