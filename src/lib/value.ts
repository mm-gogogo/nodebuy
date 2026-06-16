// 性价比排行的纯逻辑:把套餐归一成「每单位资源的等效月价」再排序。
// 复用 planBrowse 的 effectiveMonthly / pricePerGbRam / pricePerGbStorage,
// 新增「每 TB 流量」维度(站内此前没有按流量计价的视图)。纯函数,便于单测。

import { effectiveMonthly, pricePerGbRam, pricePerGbStorage, type PlanItem } from './planBrowse'

export type ValueSort = 'ram' | 'storage' | 'traffic'

export interface ValueRow {
  id: number
  name: string
  providerName: string
  providerSlug: string
  location?: string | null
  route?: string | null
  monthly: number // 等效月价($/月),Infinity=无价
  perGbRam: number | null // $/G内存/月,null=无价或无内存
  perGbStorage: number | null // $/G硬盘/月,null=无价或无硬盘
  perTbTraffic: number | null // $/TB流量/月,null=无价/无流量/不限流量
  unlimitedTraffic: boolean // trafficTB===0 视为不限流量
}

// 每 TB 月流量的等效月价($/TB/月),越小越划算。
// trafficTB<=0 视为「不限流量」——无法按量计价,返回 null,排序里单独置顶处理。
export function pricePerTbTraffic(plan: PlanItem): number | null {
  const m = effectiveMonthly(plan)
  if (!Number.isFinite(m)) return null
  if (plan.trafficTB == null || plan.trafficTB <= 0) return null
  return m / plan.trafficTB
}

const finiteOrNull = (n: number): number | null => (Number.isFinite(n) ? n : null)

export function valueRows(plans: PlanItem[]): ValueRow[] {
  return plans.map((p) => ({
    id: p.id,
    name: p.name,
    providerName: p.providerName,
    providerSlug: p.providerSlug,
    location: p.location ?? null,
    route: p.route ?? null,
    monthly: effectiveMonthly(p),
    perGbRam: finiteOrNull(pricePerGbRam(p)),
    perGbStorage: finiteOrNull(pricePerGbStorage(p)),
    perTbTraffic: pricePerTbTraffic(p),
    unlimitedTraffic: p.trafficTB === 0,
  }))
}

// 排序键:返回 { group, value }。group 小的排前(不限流量 -1 → 可计价 0 → 不可计价 1);
// 同组内按 value 升序(越便宜越靠前)。这样缺数据的行始终垫底,且互不干扰。
function rankOf(r: ValueRow, key: ValueSort): { group: number; value: number } {
  if (key === 'ram') {
    return r.perGbRam == null ? { group: 1, value: Infinity } : { group: 0, value: r.perGbRam }
  }
  if (key === 'storage') {
    return r.perGbStorage == null ? { group: 1, value: Infinity } : { group: 0, value: r.perGbStorage }
  }
  // traffic:不限流量置顶(同组内便宜的在前),其次按 $/TB 升序,最后是不可计价
  if (r.unlimitedTraffic) return { group: -1, value: r.monthly }
  return r.perTbTraffic == null ? { group: 1, value: Infinity } : { group: 0, value: r.perTbTraffic }
}

export function sortValue(rows: ValueRow[], key: ValueSort): ValueRow[] {
  return [...rows].sort((a, b) => {
    const ra = rankOf(a, key)
    const rb = rankOf(b, key)
    if (ra.group !== rb.group) return ra.group - rb.group
    return ra.value - rb.value
  })
}
