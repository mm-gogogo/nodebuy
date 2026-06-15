import { describe, it, expect } from 'vitest'
import { fmtDate, specLine, priceLine } from '@/lib/labels'
import { activeDealsWhere } from '@/lib/queries'

describe('fmtDate · 时区稳定（按 UTD 录入日期显示）', () => {
  it('当天 00:00 UTC 的日期返回录入当天，不受服务器时区影响', () => {
    expect(fmtDate('2026-05-28T00:00:00.000Z')).toBe('2026-05-28')
  })

  it('纯日期字符串正常格式化', () => {
    expect(fmtDate('2026-12-01T00:00:00.000Z')).toBe('2026-12-01')
  })

  it('空值与非法日期返回占位符', () => {
    expect(fmtDate(null)).toBe('—')
    expect(fmtDate(undefined)).toBe('—')
    expect(fmtDate('not-a-date')).toBe('—')
  })
})

describe('specLine · 配置串', () => {
  it('无 storageType 时按集合默认显示 NVMe（不是 SSD）', () => {
    expect(specLine({ cpuCores: 2, ramMB: 2048, storageGB: 40 })).toBe('2C · 2G · 40G NVMe')
  })

  it('nvme 显示为 NVMe 而非 NVME', () => {
    expect(specLine({ storageGB: 80, storageType: 'nvme' })).toBe('80G NVMe')
  })

  it('不限流量与按量显示', () => {
    expect(specLine({ trafficTB: 0 })).toBe('不限流量')
    expect(specLine({ trafficTB: 2 })).toBe('2T/月')
  })
})

describe('priceLine · 价格优先年付', () => {
  it('年付优先', () => {
    expect(priceLine({ priceMonthly: 5, priceYearly: 50 })).toEqual({ amount: '$50', cycle: '/年' })
  })
  it('仅月付', () => {
    expect(priceLine({ priceMonthly: 5 })).toEqual({ amount: '$5', cycle: '/月' })
  })
  it('无价格', () => {
    expect(priceLine({})).toEqual({ amount: '—', cycle: '' })
  })
})

describe('activeDealsWhere · 失效日期当天仍有效', () => {
  it('下界取当日 00:00 UTC，使「截至当天」的优惠当天可见', () => {
    const now = new Date('2026-06-30T15:30:00.000Z')
    const where = activeDealsWhere(now)
    const clause = (where.or as Array<Record<string, { greater_than_equal?: string }>>).find(
      (c) => c.expiresAt?.greater_than_equal,
    )
    expect(clause?.expiresAt.greater_than_equal).toBe('2026-06-30T00:00:00.000Z')
  })
})
