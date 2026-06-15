import { NextRequest } from 'next/server'
import { getPayload, type Payload } from 'payload'
import { describe, it, beforeAll, afterAll, expect } from 'vitest'

import payloadConfig from '@/payload.config'
import { GET } from '@/app/go/[slug]/route'

// 端到端验证 /go 跳转路由：取数 → 归属校验 → 链接收敛 → 302/回落。
const TAG = 'itest-go'

let payload: Payload

async function go(slug: string, query = '') {
  const req = new NextRequest(`http://localhost:3000/go/${slug}${query}`)
  return GET(req, { params: Promise.resolve({ slug }) })
}

describe('/go 跳转路由', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await payloadConfig })
    // affUrl 故意填裸域名（漏 https://），验证收敛后不再 500
    await payload.create({
      collection: 'providers',
      data: { name: 'Go Provider', slug: `${TAG}-bare`, affUrl: 'go-aff.example/track?id=9' },
    })
    await payload.create({
      collection: 'providers',
      data: { name: 'Go NoUrl', slug: `${TAG}-nourl` },
    })
  })

  afterAll(async () => {
    for (const slug of [`${TAG}-bare`, `${TAG}-nourl`]) {
      await payload.delete({ collection: 'providers', where: { slug: { equals: slug } } })
    }
  })

  it('裸域名 affUrl 被收敛为绝对 https 并 302（不再 500）', async () => {
    const res = await go(`${TAG}-bare`)
    expect(res.status).toBe(302)
    expect(res.headers.get('location')).toBe('https://go-aff.example/track?id=9')
  })

  it('服务商不存在 → 302 回首页', async () => {
    const res = await go(`${TAG}-does-not-exist`)
    expect(res.status).toBe(302)
    expect(res.headers.get('location')).toMatch(/\/$/)
  })

  it('无任何链接 → 回落到服务商档案页', async () => {
    const res = await go(`${TAG}-nourl`)
    expect(res.status).toBe(302)
    expect(res.headers.get('location')).toContain(`/providers/${TAG}-nourl`)
  })
})
