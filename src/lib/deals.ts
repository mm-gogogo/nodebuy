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
