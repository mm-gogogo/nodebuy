// 后台只读列「等效月价」的计算(纯函数):优先月付,否则年付/12(两位四舍五入);
// 两者都无则 null(列表里留空,而非前台排序用的 Infinity)。
export function effectiveMonthlyDisplay(priceMonthly: unknown, priceYearly: unknown): number | null {
  if (typeof priceMonthly === 'number' && Number.isFinite(priceMonthly)) return priceMonthly
  if (typeof priceYearly === 'number' && Number.isFinite(priceYearly)) {
    return Math.round((priceYearly / 12) * 100) / 100
  }
  return null
}
