import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

import { describe, it, beforeAll, expect } from 'vitest'
import { validateOptionalUrl } from '@/lib/urlValidation'

describe('validateOptionalUrl', () => {
  it('空值放行(字段可空)', () => {
    expect(validateOptionalUrl('')).toBe(true)
    expect(validateOptionalUrl(null)).toBe(true)
    expect(validateOptionalUrl(undefined)).toBe(true)
  })
  it('http(s) 合法链接通过', () => {
    expect(validateOptionalUrl('https://example.com/aff?ref=1')).toBe(true)
    expect(validateOptionalUrl('http://example.com')).toBe(true)
  })
  it('裸域名 / 协议相对会被收敛,视为合法(与 /go 跳转一致)', () => {
    expect(validateOptionalUrl('example.com')).toBe(true)
    expect(validateOptionalUrl('go-aff.example/track?id=9')).toBe(true)
    expect(validateOptionalUrl('//example.com')).toBe(true)
  })
  it('收敛不出 http(s) 的乱串被拒', () => {
    expect(validateOptionalUrl('not a url')).toMatch(/http/)
    expect(validateOptionalUrl('http://exa mple.com')).toMatch(/http/)
  })
  it('非 http(s) 协议被拒(含 javascript:/ftp:/mailto:)', () => {
    expect(validateOptionalUrl('javascript:alert(1)')).toMatch(/http/)
    expect(validateOptionalUrl('ftp://example.com')).toMatch(/http/)
    expect(validateOptionalUrl('mailto:a@b.com')).toMatch(/http/)
  })
  it('非字符串被拒', () => {
    expect(validateOptionalUrl(123)).toMatch(/文本/)
  })
})

describe('外链校验(集成)', () => {
  let payload: Payload
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
  })

  it('非法 affUrl 被拒', async () => {
    await expect(
      payload.create({
        collection: 'providers',
        data: { name: 'URL VALIDATION BAD', slug: 'url-validation-bad', affUrl: 'not a url' },
      }),
    ).rejects.toThrow()
  })
  it('javascript: 链接被拒(防注入)', async () => {
    await expect(
      payload.create({
        collection: 'providers',
        data: { name: 'URL VALIDATION XSS', slug: 'url-validation-xss', website: 'javascript:alert(1)' },
      }),
    ).rejects.toThrow()
  })
  it('合法 https 外链可创建', async () => {
    const created = await payload.create({
      collection: 'providers',
      data: {
        name: 'URL VALIDATION OK',
        slug: 'url-validation-ok',
        affUrl: 'https://example.com/aff',
        website: 'https://example.com',
      },
    })
    expect(created.affUrl).toBe('https://example.com/aff')
    await payload.delete({ collection: 'providers', id: created.id })
  })
})
