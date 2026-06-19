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
      datacenterCount: 8, regions: ['北美', '欧洲', '亚太'], cnOptimized: true,
    },
    {
      name: 'Hetzner', slug: 'hetzner', overallScore: 8.1,
      scores: { performance: 8.5, network: null, value: 9.2, support: 7 },
      founded: null, headquarters: null, paymentMethods: [],
      datacenterCount: 2, regions: ['欧洲'], cnOptimized: false,
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
    expect(get('区域覆盖')).toEqual(['北美/欧洲/亚太', '欧洲'])
    expect(get('大陆优化')).toEqual(['✓', '—'])
  })

  it('区域覆盖缺省时回退为 —', () => {
    const rows = compareProviderRows([
      { name: 'X', slug: 'x', datacenterCount: 0, cnOptimized: false }, // regions 省略
      { name: 'Y', slug: 'y', datacenterCount: 1, regions: [], cnOptimized: false }, // 空数组
    ])
    expect(rows.find((r) => r.label === '区域覆盖')?.values).toEqual(['—', '—'])
  })

  it('标记每项最优列(bwh=0, hetzner=1)', () => {
    const rows = compareProviderRows(ps)
    const best = (l: string) => rows.find((r) => r.label === l)?.best
    expect(best('综合评分')).toEqual([0]) // 8.9 > 8.1
    expect(best('性能')).toEqual([1]) // 8.5 > 8.2
    expect(best('网络')).toEqual([]) // hetzner 缺分,可比项不足两个 → 不标
    expect(best('性价比')).toEqual([1]) // 9.2 > 7.6
    expect(best('售后')).toEqual([0]) // 7.8 > 7
    expect(best('机房数')).toEqual([0]) // 8 > 2
    // 定性行不打标
    expect(best('成立')).toBeUndefined()
    expect(best('总部')).toBeUndefined()
    expect(best('付款')).toBeUndefined()
    expect(best('区域覆盖')).toBeUndefined()
    expect(best('大陆优化')).toBeUndefined()
  })

  it('每行 values 数量与服务商数一致', () => {
    for (const row of compareProviderRows(ps)) expect(row.values).toHaveLength(ps.length)
  })
})
