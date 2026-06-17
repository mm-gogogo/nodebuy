import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

import { describe, it, beforeAll, expect } from 'vitest'

// 验证 deals 的 expiryStatus 虚拟列在真实 Payload 上据失效日期自动判定。
let payload: Payload
let providerId: number

describe('deal expiryStatus 只读计算列(集成)', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    // 固定取种子服务商,避免与并行测试建删服务商竞态(见 #56)
    const provs = await payload.find({ collection: 'providers', where: { slug: { equals: 'bandwagonhost' } }, limit: 1 })
    providerId = provs.docs[0].id as number
  })

  const mkDeal = (over: Record<string, unknown>) =>
    payload.create({ collection: 'deals', data: { title: 'STATUS TEST DEAL', provider: providerId, ...over } })

  it('过去日期 → 已过期', async () => {
    const created = await mkDeal({ expiresAt: '2020-01-01' })
    expect(created.expiryStatus).toBe('已过期')
    await payload.delete({ collection: 'deals', id: created.id })
  })
  it('远未来日期 → 有效', async () => {
    const created = await mkDeal({ expiresAt: '2030-01-01' })
    expect(created.expiryStatus).toBe('有效')
    await payload.delete({ collection: 'deals', id: created.id })
  })
  it('无失效日期 → 长期有效(读取也填充)', async () => {
    const created = await mkDeal({})
    expect(created.expiryStatus).toBe('长期有效')
    const read = await payload.findByID({ collection: 'deals', id: created.id })
    expect(read.expiryStatus).toBe('长期有效')
    await payload.delete({ collection: 'deals', id: created.id })
  })
})
