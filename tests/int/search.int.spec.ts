import { getPayload, type Payload } from 'payload'
import { describe, it, beforeAll, expect } from 'vitest'

import config from '@/payload.config'
import { likeAny, searchAll } from '@/lib/search'

describe('likeAny(纯函数)', () => {
  it('单字段', () => {
    expect(likeAny(['name'], 'abc')).toEqual({ or: [{ name: { like: 'abc' } }] })
  })
  it('多字段拼成 or', () => {
    expect(likeAny(['name', 'tagline'], 'x')).toEqual({
      or: [{ name: { like: 'x' } }, { tagline: { like: 'x' } }],
    })
  })
})

describe('searchAll(集成,依赖种子数据)', () => {
  let payload: Payload
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
  })

  it('空关键词返回空结果', async () => {
    const r = await searchAll(payload, '   ')
    expect(r.total).toBe(0)
    expect(r.providers).toEqual([])
  })

  it('按服务商名命中', async () => {
    const r = await searchAll(payload, 'bandwagon')
    expect(r.providers.some((p) => p.slug === 'bandwagonhost')).toBe(true)
    expect(r.total).toBeGreaterThan(0)
  })

  it('只返回已发布测评(草稿不外泄)', async () => {
    const r = await searchAll(payload, '搬瓦工')
    // 命中的测评必须都能在已发布查询里找到
    for (const rev of r.reviews) {
      const check = await payload.find({
        collection: 'reviews',
        where: { and: [{ id: { equals: rev.id } }, { _status: { equals: 'published' } }] },
      })
      expect(check.totalDocs).toBe(1)
    }
  })

  it('无匹配关键词返回 0', async () => {
    const r = await searchAll(payload, 'zzz-不存在-的关键词-zzz')
    expect(r.total).toBe(0)
  })
})
