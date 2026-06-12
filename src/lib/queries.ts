import type { Where } from 'payload'

// 仅保留未过期的优惠：没有失效日期，或失效日期在当前时刻之后
export function activeDealsWhere(): Where {
  return {
    or: [{ expiresAt: { exists: false } }, { expiresAt: { greater_than_equal: new Date().toISOString() } }],
  }
}
