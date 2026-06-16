import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

import { describe, it, beforeAll, expect } from 'vitest'

// 验证 slug 字段的 beforeValidate hook 在真实 Payload 上确实生效(以 providers 为例,源字段=name)。
let payload: Payload

describe('slug 自动生成 hook(集成)', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
  })

  it('未填 slug 时按名称自动生成', async () => {
    const created = await payload.create({
      collection: 'providers',
      // @ts-expect-error 仅传必填的 name,slug 交由 hook 生成
      data: { name: 'Auto Slug Test Co' },
    })
    expect(created.slug).toBe('auto-slug-test-co')
    await payload.delete({ collection: 'providers', id: created.id })
  })

  it('已填 slug 时保留人工值(中文名也不影响)', async () => {
    const created = await payload.create({
      collection: 'providers',
      // @ts-expect-error 仅传必填字段
      data: { name: '中文测试服务商', slug: 'manual-kept-slug' },
    })
    expect(created.slug).toBe('manual-kept-slug')
    await payload.delete({ collection: 'providers', id: created.id })
  })
})
