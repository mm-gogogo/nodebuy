import type { Where } from 'payload'

// 仅保留未过期的优惠：没有失效日期，或失效日期当天仍算有效。
// expiresAt 存为当天 00:00 UTC，用「今天 00:00 UTC」作为下界，
// 这样标注「截至 6-30」的优惠在 6-30 全天可见，7-1 零点起才隐藏，与展示日期一致。
export function activeDealsWhere(now: Date = new Date()): Where {
  const startOfTodayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  return {
    or: [
      { expiresAt: { exists: false } },
      { expiresAt: { greater_than_equal: startOfTodayUTC.toISOString() } },
    ],
  }
}

// 某服务商当前有效的优惠:在「未过期」基础上叠加 provider 过滤,用于服务商详情页。
export function providerActiveDealsWhere(providerId: number | string, now: Date = new Date()): Where {
  return { and: [activeDealsWhere(now), { provider: { equals: providerId } }] }
}
