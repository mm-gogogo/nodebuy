import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

import { describe, it, beforeAll, expect } from 'vitest'
import { reviewOverallDisplay, reviewDataStatus } from '@/lib/reviewComputed'

describe('reviewOverallDisplay', () => {
  it('四项均值,保留一位小数', () => {
    expect(reviewOverallDisplay({ performance: 8, network: 9, value: 7, support: 8 })).toBe(8) // 32/4
    expect(reviewOverallDisplay({ performance: 6, network: 7, value: 8, support: 9 })).toBe(7.5) // 30/4
    expect(reviewOverallDisplay({ performance: 8, network: 8, value: 8, support: 7 })).toBe(7.8) // 31/4=7.75→7.8
  })
  it('只计有值项', () => {
    expect(reviewOverallDisplay({ performance: 9 })).toBe(9)
  })
  it('无评分/空为 null', () => {
    expect(reviewOverallDisplay({})).toBeNull()
    expect(reviewOverallDisplay(null)).toBeNull()
    expect(reviewOverallDisplay(undefined)).toBeNull()
  })
})

describe('reviewDataStatus', () => {
  it('据 GB5 跑分 / 测速节点判定四种状态', () => {
    expect(reviewDataStatus({ gb5Single: 1200, speedtests: [{ node: 'CN' }] })).toBe('跑分 · 测速')
    expect(reviewDataStatus({ gb5Single: 1200 })).toBe('仅跑分')
    expect(reviewDataStatus({ speedtests: [{ node: 'CN' }] })).toBe('仅测速')
    expect(reviewDataStatus({})).toBe('无数据')
  })
  it('空 benchmarks / 空测速数组 / 缺 GB5 视为无对应数据', () => {
    expect(reviewDataStatus(null)).toBe('无数据')
    expect(reviewDataStatus(undefined)).toBe('无数据')
    expect(reviewDataStatus({ gb5Single: null, speedtests: [] })).toBe('无数据')
  })
})

describe('overall 只读计算列(集成)', () => {
  let payload: Payload
  let providerId: number

  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    // 固定取种子服务商,避免与并行测试建删服务商竞态(见 #56)
    const provs = await payload.find({ collection: 'providers', where: { slug: { equals: 'bandwagonhost' } }, limit: 1 })
    providerId = provs.docs[0].id as number
  })

  it('创建带分项评分的测评时自动算出综合评分', async () => {
    const created = await payload.create({
      collection: 'reviews',
      data: {
        title: 'Overall Compute Test',
        slug: 'overall-compute-test',
        provider: providerId,
        publishedAt: '2026-01-01',
        scores: { performance: 8, network: 9, value: 7, support: 8 },
      },
    })
    expect(created.overall).toBe(8)
    const read = await payload.findByID({ collection: 'reviews', id: created.id })
    expect(read.overall).toBe(8)
    await payload.delete({ collection: 'reviews', id: created.id })
  })

  it('无评分时综合评分为 null', async () => {
    const created = await payload.create({
      collection: 'reviews',
      data: { title: 'No Score Test', slug: 'no-score-test', provider: providerId, publishedAt: '2026-01-01' },
    })
    expect(created.overall ?? null).toBeNull()
    await payload.delete({ collection: 'reviews', id: created.id })
  })

  it('数据完整度据 benchmarks 自动判定', async () => {
    const full = await payload.create({
      collection: 'reviews',
      data: {
        title: 'Data Status Full',
        slug: 'data-status-full',
        provider: providerId,
        publishedAt: '2026-01-01',
        benchmarks: { gb5Single: 1200, speedtests: [{ node: '电信 CN', downloadMbps: 100 }] },
      },
    })
    expect(full.dataStatus).toBe('跑分 · 测速')
    await payload.delete({ collection: 'reviews', id: full.id })

    const none = await payload.create({
      collection: 'reviews',
      data: { title: 'Data Status None', slug: 'data-status-none', provider: providerId, publishedAt: '2026-01-01' },
    })
    expect(none.dataStatus).toBe('无数据')
    await payload.delete({ collection: 'reviews', id: none.id })
  })
})
