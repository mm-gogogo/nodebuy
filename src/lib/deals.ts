// 优惠到期紧迫度(纯函数,UTC 口径与 fmtDate / activeDealsWhere 一致)。

// 距到期还有几天:今天到期 = 0,明天 = 1,已过期为负。非法日期返回 Infinity。
export function daysUntilExpiry(expiresAt: string, now: Date = new Date()): number {
  const exp = new Date(expiresAt)
  if (Number.isNaN(exp.getTime())) return Infinity
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  const expDay = Date.UTC(exp.getUTCFullYear(), exp.getUTCMonth(), exp.getUTCDate())
  return Math.round((expDay - today) / 86_400_000)
}

// 距到期 <= SOON_DAYS 天(含今天)算「即将到期」,返回展示文案;否则 null。
const SOON_DAYS = 3

export function expiryUrgency(expiresAt: string | null | undefined, now: Date = new Date()): string | null {
  if (!expiresAt) return null
  const days = daysUntilExpiry(expiresAt, now)
  if (days < 0 || days > SOON_DAYS) return null
  return days === 0 ? '今天到期' : `还剩 ${days} 天`
}

// 后台只读「状态」列:据失效日期与当前日期判定。无日期/非法日期当作长期有效。
//  已过期(< 0) / 即将过期(0..SOON_DAYS) / 有效(> SOON_DAYS) / 长期有效(无失效日期)
export function dealStatus(expiresAt: string | null | undefined, now: Date = new Date()): string {
  if (!expiresAt) return '长期有效'
  const days = daysUntilExpiry(expiresAt, now)
  if (!Number.isFinite(days)) return '长期有效'
  if (days < 0) return '已过期'
  if (days <= SOON_DAYS) return '即将过期'
  return '有效'
}

type SortableDeal = { featured?: boolean | null; expiresAt?: string | null }

// 「优惠速递」列表排序:置顶优先 → 快到期的在前 → 长期有效(无/非法失效日期)垫底。
// 纯函数、稳定排序(同档维持入参原序),不改动入参数组。与列表里的「⏳ 还剩 X 天」
// 紧迫度提示口径一致,让真正快过期的优惠浮到前面,而不是被长期有效的压在下面。
export function sortDealsByUrgency<T extends SortableDeal>(deals: readonly T[], now: Date = new Date()): T[] {
  const dated = (d: T): number | null => {
    if (!d.expiresAt) return null
    const days = daysUntilExpiry(d.expiresAt, now)
    return Number.isFinite(days) ? days : null
  }
  return deals
    .map((deal, index) => ({ deal, index, days: dated(deal) }))
    .sort((a, b) => {
      // 1) 置顶优先
      const fa = a.deal.featured ? 1 : 0
      const fb = b.deal.featured ? 1 : 0
      if (fa !== fb) return fb - fa
      // 2) 有到期日的排在长期有效之前
      const aDated = a.days !== null
      const bDated = b.days !== null
      if (aDated !== bDated) return aDated ? -1 : 1
      // 3) 都有到期日:快到期的在前(天数升序)
      if (aDated && bDated && a.days !== b.days) return (a.days as number) - (b.days as number)
      // 4) 其余维持入参原序(稳定)
      return a.index - b.index
    })
    .map((x) => x.deal)
}
