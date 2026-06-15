import { describe, it, expect } from 'vitest'
import { reviewRowMetrics } from '@/lib/reviewMetrics'

describe('reviewRowMetrics', () => {
  it('同时有 GB5 单核与网络评分', () => {
    expect(reviewRowMetrics({ benchmarks: { gb5Single: 1042 }, scores: { network: 9.6 } })).toEqual([
      { label: 'GB5', value: '1042' },
      { label: '网络', value: '9.6' },
    ])
  })

  it('网络评分保留一位小数（含整数）', () => {
    expect(reviewRowMetrics({ scores: { network: 9 } })).toEqual([{ label: '网络', value: '9.0' }])
  })

  it('网络评分为 0 仍显示（区别于缺失）', () => {
    expect(reviewRowMetrics({ scores: { network: 0 } })).toEqual([{ label: '网络', value: '0.0' }])
  })

  it('只有 GB5', () => {
    expect(reviewRowMetrics({ benchmarks: { gb5Single: 880 } })).toEqual([{ label: 'GB5', value: '880' }])
  })

  it('GB5 为 0 或缺失时不显示', () => {
    expect(reviewRowMetrics({ benchmarks: { gb5Single: 0 } })).toEqual([])
    expect(reviewRowMetrics({})).toEqual([])
  })

  it('缺字段安全处理', () => {
    expect(reviewRowMetrics({ benchmarks: null, scores: null })).toEqual([])
  })
})
