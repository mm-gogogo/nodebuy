import { describe, it, expect } from 'vitest'
import { buildProviderQuery, readProviderQuery, DEFAULT_PROVIDER_STATE } from '@/lib/providerQuery'

describe('buildProviderQuery', () => {
  it('默认状态产出空查询', () => {
    expect(buildProviderQuery(DEFAULT_PROVIDER_STATE)).toBe('')
  })
  it('只写入非默认值', () => {
    const p = new URLSearchParams(
      buildProviderQuery({
        query: ' bwh ',
        cnOnly: true,
        inStockOnly: true,
        region: 'apac',
        payment: 'alipay',
        sort: 'price',
      }),
    )
    expect(p.get('q')).toBe('bwh')
    expect(p.get('cn')).toBe('1')
    expect(p.get('stock')).toBe('1')
    expect(p.get('region')).toBe('apac')
    expect(p.get('pay')).toBe('alipay')
    expect(p.get('sort')).toBe('price')
  })
})

describe('readProviderQuery', () => {
  it('空参数得到默认状态', () => {
    expect(readProviderQuery({})).toEqual(DEFAULT_PROVIDER_STATE)
  })
  it('解析各字段', () => {
    expect(readProviderQuery({ q: 'x', cn: '1', stock: '1', region: 'eu', pay: 'crypto', sort: 'plans' })).toEqual({
      query: 'x',
      cnOnly: true,
      inStockOnly: true,
      region: 'eu',
      payment: 'crypto',
      sort: 'plans',
    })
  })
  it('非法 sort 回落 score', () => {
    expect(readProviderQuery({ sort: 'bogus' }).sort).toBe('score')
  })
  it('布尔仅 "1" 为真', () => {
    expect(readProviderQuery({ cn: 'true' }).cnOnly).toBe(false)
    expect(readProviderQuery({ cn: '1' }).cnOnly).toBe(true)
  })
  it('数组参数取第一个', () => {
    expect(readProviderQuery({ region: ['na', 'eu'] }).region).toBe('na')
  })
})

describe('往返一致', () => {
  it('build → read 还原非默认状态', () => {
    const state = {
      query: 'cloud',
      cnOnly: true,
      inStockOnly: false,
      region: 'na',
      payment: 'paypal',
      sort: 'name' as const,
    }
    const params = Object.fromEntries(new URLSearchParams(buildProviderQuery(state)))
    expect(readProviderQuery(params)).toEqual(state)
  })
})
