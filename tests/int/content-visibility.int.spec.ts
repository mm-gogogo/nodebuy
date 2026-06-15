import { getPayload, type Payload } from 'payload'
import { describe, it, beforeAll, afterAll, expect } from 'vitest'

import config from '@/payload.config'
import { activeDealsWhere } from '@/lib/queries'

// 回归测试：锁住「草稿不外泄」与「过期优惠被过滤」两处修复。
const TAG = 'itest-visibility'

let payload: Payload
let providerId: number

describe('内容可见性', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    const provider = await payload.create({
      collection: 'providers',
      data: { name: 'ITest Provider', slug: `${TAG}-provider`, website: 'https://itest.example' },
    })
    providerId = provider.id as number
  })

  afterAll(async () => {
    // 关联删除：先删依赖再删 provider
    for (const collection of ['reviews', 'deals'] as const) {
      await payload.delete({ collection, where: { provider: { equals: providerId } } })
    }
    await payload.delete({ collection: 'providers', where: { slug: { equals: `${TAG}-provider` } } })
  })

  it('已发布过滤只返回 published 测评，草稿不外泄', async () => {
    await payload.create({
      collection: 'reviews',
      data: {
        title: 'Published Review',
        slug: `${TAG}-published`,
        provider: providerId,
        publishedAt: new Date().toISOString(),
        _status: 'published',
      },
    })
    await payload.create({
      collection: 'reviews',
      data: {
        title: 'Draft Review',
        slug: `${TAG}-draft`,
        provider: providerId,
        publishedAt: new Date().toISOString(),
        _status: 'draft',
      },
    })

    const result = await payload.find({
      collection: 'reviews',
      where: { and: [{ provider: { equals: providerId } }, { _status: { equals: 'published' } }] },
    })

    const slugs = result.docs.map((d) => d.slug)
    expect(slugs).toContain(`${TAG}-published`)
    expect(slugs).not.toContain(`${TAG}-draft`)
  })

  it('activeDealsWhere 过滤掉已过期优惠，保留未过期与无失效日期', async () => {
    const day = 24 * 60 * 60 * 1000
    await payload.create({
      collection: 'deals',
      data: {
        title: 'Expired Deal',
        provider: providerId,
        expiresAt: new Date(Date.now() - day).toISOString(),
      },
    })
    await payload.create({
      collection: 'deals',
      data: {
        title: 'Future Deal',
        provider: providerId,
        expiresAt: new Date(Date.now() + day).toISOString(),
      },
    })
    await payload.create({
      collection: 'deals',
      data: { title: 'No-Expiry Deal', provider: providerId },
    })

    const result = await payload.find({
      collection: 'deals',
      where: { and: [{ provider: { equals: providerId } }, activeDealsWhere()] },
    })

    const titles = result.docs.map((d) => d.title)
    expect(titles).toContain('Future Deal')
    expect(titles).toContain('No-Expiry Deal')
    expect(titles).not.toContain('Expired Deal')
  })
})
