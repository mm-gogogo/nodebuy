import { getPayload, type Payload } from 'payload'
import { describe, it, beforeAll, afterAll, expect } from 'vitest'

import config from '@/payload.config'

// 验证 validateSlug 真的接到了 Payload 字段上：非法 slug 应被 create 拒绝。
const TAG = 'itest-slug'

let payload: Payload

describe('slug 字段校验在 Payload 层生效', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
  })

  afterAll(async () => {
    await payload.delete({ collection: 'providers', where: { slug: { equals: `${TAG}-ok` } } })
  })

  it('非法 slug 被拒绝', async () => {
    await expect(
      payload.create({ collection: 'providers', data: { name: 'Bad', slug: 'Bad Slug With Spaces' } }),
    ).rejects.toThrow()
  })

  it('合法 slug 正常创建', async () => {
    const doc = await payload.create({
      collection: 'providers',
      data: { name: 'Ok', slug: `${TAG}-ok` },
    })
    expect(doc.slug).toBe(`${TAG}-ok`)
  })
})
