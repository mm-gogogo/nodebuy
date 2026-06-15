import { describe, it, expect } from 'vitest'
import { daysUntilExpiry, expiryUrgency } from '@/lib/deals'

const now = new Date('2026-06-15T10:00:00.000Z')

describe('daysUntilExpiry', () => {
  it('今天到期为 0', () => {
    expect(daysUntilExpiry('2026-06-15T00:00:00.000Z', now)).toBe(0)
  })
  it('明天为 1、三天后为 3', () => {
    expect(daysUntilExpiry('2026-06-16T00:00:00.000Z', now)).toBe(1)
    expect(daysUntilExpiry('2026-06-18T00:00:00.000Z', now)).toBe(3)
  })
  it('已过期为负', () => {
    expect(daysUntilExpiry('2026-06-14T00:00:00.000Z', now)).toBe(-1)
  })
  it('非法日期返回 Infinity', () => {
    expect(daysUntilExpiry('not-a-date', now)).toBe(Infinity)
  })
})

describe('expiryUrgency', () => {
  it('今天到期', () => {
    expect(expiryUrgency('2026-06-15', now)).toBe('今天到期')
  })
  it('几天内显示剩余天数', () => {
    expect(expiryUrgency('2026-06-16', now)).toBe('还剩 1 天')
    expect(expiryUrgency('2026-06-18', now)).toBe('还剩 3 天')
  })
  it('超过 3 天不提示', () => {
    expect(expiryUrgency('2026-06-19', now)).toBeNull()
    expect(expiryUrgency('2026-12-31', now)).toBeNull()
  })
  it('已过期不提示', () => {
    expect(expiryUrgency('2026-06-14', now)).toBeNull()
  })
  it('无失效日期不提示', () => {
    expect(expiryUrgency(null, now)).toBeNull()
    expect(expiryUrgency(undefined, now)).toBeNull()
  })
})
