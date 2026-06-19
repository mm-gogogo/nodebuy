import { describe, it, expect } from 'vitest'
import { activeDealsWhere, providerActiveDealsWhere } from '@/lib/queries'

const now = new Date('2026-06-15T10:00:00.000Z')

describe('providerActiveDealsWhere', () => {
  it('用 and 组合「未过期」与 provider 过滤,复用 activeDealsWhere 口径', () => {
    expect(providerActiveDealsWhere(42, now)).toEqual({
      and: [activeDealsWhere(now), { provider: { equals: 42 } }],
    })
  })

  it('支持字符串 id', () => {
    const w = providerActiveDealsWhere('abc123', now)
    expect(w.and?.[1]).toEqual({ provider: { equals: 'abc123' } })
  })

  it('沿用当天 00:00 UTC 下界(与 activeDealsWhere 一致)', () => {
    const w = providerActiveDealsWhere(1, now)
    expect(w.and?.[0]).toEqual({
      or: [
        { expiresAt: { exists: false } },
        { expiresAt: { greater_than_equal: '2026-06-15T00:00:00.000Z' } },
      ],
    })
  })
})
