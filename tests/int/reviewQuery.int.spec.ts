import { describe, it, expect } from 'vitest'
import { buildReviewQuery, readReviewQuery, DEFAULT_REVIEW_STATE } from '@/lib/reviewQuery'

describe('buildReviewQuery', () => {
  it('默认状态产出空查询', () => {
    expect(buildReviewQuery(DEFAULT_REVIEW_STATE)).toBe('')
  })
  it('只写入非默认值,去空白', () => {
    const p = new URLSearchParams(buildReviewQuery({ query: ' cn2 ', provider: 'bwh', sort: 'overall' }))
    expect(p.get('q')).toBe('cn2')
    expect(p.get('provider')).toBe('bwh')
    expect(p.get('sort')).toBe('overall')
  })
  it('provider=all 与 sort=newest 不写入', () => {
    expect(buildReviewQuery({ query: '', provider: 'all', sort: 'newest' })).toBe('')
  })
})

describe('readReviewQuery', () => {
  it('空参数得到默认状态', () => {
    expect(readReviewQuery({})).toEqual(DEFAULT_REVIEW_STATE)
  })
  it('解析字段', () => {
    expect(readReviewQuery({ q: 'x', provider: 'hetzner', sort: 'network' })).toEqual({
      query: 'x',
      provider: 'hetzner',
      sort: 'network',
    })
  })
  it('非法 sort 回落到 newest', () => {
    expect(readReviewQuery({ sort: 'bogus' }).sort).toBe('newest')
  })
  it('数组取第一个', () => {
    expect(readReviewQuery({ provider: ['a', 'b'] }).provider).toBe('a')
  })
})

describe('往返一致', () => {
  it('build → read 还原', () => {
    const state = { query: 'gia', provider: 'bwh', sort: 'value' as const }
    const params = Object.fromEntries(new URLSearchParams(buildReviewQuery(state)))
    expect(readReviewQuery(params)).toEqual(state)
  })
})
