import { describe, it, expect } from 'vitest'
import { buildPlanQuery, readPlanQuery, DEFAULT_PLAN_STATE } from '@/lib/planQuery'

describe('buildPlanQuery', () => {
  it('默认状态产出空查询', () => {
    expect(buildPlanQuery(DEFAULT_PLAN_STATE)).toBe('')
  })
  it('只写入非默认值', () => {
    const qs = buildPlanQuery({
      query: ' bwh ',
      route: 'cn2gia',
      sort: 'ram-desc',
      maxPrice: '10',
      minRamMB: 2048,
      inStockOnly: true,
      storageType: 'nvme',
      region: 'apac',
    })
    const p = new URLSearchParams(qs)
    expect(p.get('q')).toBe('bwh') // 去空白
    expect(p.get('route')).toBe('cn2gia')
    expect(p.get('sort')).toBe('ram-desc')
    expect(p.get('max')).toBe('10')
    expect(p.get('ram')).toBe('2048')
    expect(p.get('stock')).toBe('1')
    expect(p.get('disk')).toBe('nvme')
    expect(p.get('region')).toBe('apac')
  })
  it('storageType=all / region=all 不写入', () => {
    expect(buildPlanQuery({ ...DEFAULT_PLAN_STATE, storageType: 'all', region: 'all' })).toBe('')
  })
  it('price-asc 与 all 等默认不写入', () => {
    expect(buildPlanQuery({ ...DEFAULT_PLAN_STATE, sort: 'price-asc', route: 'all' })).toBe('')
  })
})

describe('readPlanQuery', () => {
  it('空参数得到默认状态', () => {
    expect(readPlanQuery({})).toEqual(DEFAULT_PLAN_STATE)
  })
  it('解析各字段', () => {
    expect(
      readPlanQuery({
        q: 'x',
        route: 'cmin2',
        sort: 'price-desc',
        max: '20',
        ram: '4096',
        stock: '1',
        disk: 'hdd',
        region: 'na',
      }),
    ).toEqual({
      query: 'x',
      route: 'cmin2',
      sort: 'price-desc',
      maxPrice: '20',
      minRamMB: 4096,
      inStockOnly: true,
      storageType: 'hdd',
      region: 'na',
    })
  })
  it('非法 region 回落 all', () => {
    expect(readPlanQuery({ region: 'mars' }).region).toBe('all')
    expect(readPlanQuery({ region: 'eu' }).region).toBe('eu')
  })
  it('非法 sort 回落 price-asc', () => {
    expect(readPlanQuery({ sort: 'bogus' }).sort).toBe('price-asc')
  })
  it('value-traffic 是合法 sort', () => {
    expect(readPlanQuery({ sort: 'value-traffic' }).sort).toBe('value-traffic')
  })
  it('非法 disk 回落 all', () => {
    expect(readPlanQuery({ disk: 'sata' }).storageType).toBe('all')
    expect(readPlanQuery({ disk: 'ssd' }).storageType).toBe('ssd')
  })
  it('非法 ram 回落 0', () => {
    expect(readPlanQuery({ ram: '777' }).minRamMB).toBe(0)
    expect(readPlanQuery({ ram: 'abc' }).minRamMB).toBe(0)
  })
  it('stock 仅 "1" 为真', () => {
    expect(readPlanQuery({ stock: '1' }).inStockOnly).toBe(true)
    expect(readPlanQuery({ stock: 'true' }).inStockOnly).toBe(false)
  })
  it('数组参数取第一个', () => {
    expect(readPlanQuery({ q: ['a', 'b'] }).query).toBe('a')
  })
})

describe('往返一致', () => {
  it('build → read 还原非默认状态', () => {
    const state = {
      query: 'cn2',
      route: 'cn2gia',
      sort: 'value-traffic' as const,
      maxPrice: '15',
      minRamMB: 8192,
      inStockOnly: true,
      storageType: 'nvme',
      region: 'apac',
    }
    const params = Object.fromEntries(new URLSearchParams(buildPlanQuery(state)))
    expect(readPlanQuery(params)).toEqual(state)
  })
})
