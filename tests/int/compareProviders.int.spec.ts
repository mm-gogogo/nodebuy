import { describe, it, expect } from 'vitest'
import {
  parseProviderSlugs,
  compareProviderRows,
  MAX_COMPARE_PROVIDERS,
  type CompareProvider,
} from '@/lib/compareProviders'

describe('parseProviderSlugs', () => {
  it('解析逗号分隔的 slug', () => {
    expect(parseProviderSlugs('bwh,dmit')).toEqual(['bwh', 'dmit'])
  })
  it('去重保序', () => {
    expect(parseProviderSlugs('a,a,b,a')).toEqual(['a', 'b'])
  })
  it('过滤非法 slug(大写/空格/符号)', () => {
    expect(parseProviderSlugs('bwh,Big Slug,ok-slug,bad_slug')).toEqual(['bwh', 'ok-slug'])
  })
  it('限量到 MAX', () => {
    expect(parseProviderSlugs('a,b,c,d,e').length).toBe(MAX_COMPARE_PROVIDERS)
  })
  it('空/缺省返回空', () => {
    expect(parseProviderSlugs('')).toEqual([])
    expect(parseProviderSlugs(null)).toEqual([])
  })
})

describe('compareProviderRows', () => {
  const ps: CompareProvider[] = [
    {
      name: '搬瓦工', slug: 'bwh', overallScore: 8.9,
      scores: { performance: 8.2, network: 9.6, value: 7.6, support: 7.8 },
      founded: 2012, headquarters: '加拿大', paymentMethods: ['alipay', 'paypal'],
      datacenterCount: 8, cnOptimized: true,
    },
    {
      name: 'Hetzner', slug: 'hetzner', overallScore: 8.1,
      scores: { performance: 8.5, network: null, value: 9.2, support: 7 },
      founded: null, headquarters: null, paymentMethods: [],
      datacenterCount: 2, cnOptimized: false,
    },
  ]

  it('生成属性 × 服务商的行', () => {
    const rows = compareProviderRows(ps)
    const get = (l: string) => rows.find((r) => r.label === l)?.values
    expect(get('综合评分')).toEqual(['8.9', '8.1'])
    expect(get('网络')).toEqual(['9.6', '—']) // null → —
    expect(get('成立')).toEqual(['2012', '—'])
    expect(get('总部')).toEqual(['加拿大', '—'])
    expect(get('付款')).toEqual(['支付宝 · PayPal', '—']) // 空数组 → —
    expect(get('机房数')).toEqual(['8', '2'])
    expect(get('大陆优化')).toEqual(['✓', '—'])
  })

  it('每行 values 数量与服务商数一致', () => {
    for (const row of compareProviderRows(ps)) expect(row.values).toHaveLength(ps.length)
  })
})
