import { describe, it, expect } from 'vitest'
import { isValidSlug, validateSlug, slugify, autoSlug } from '@/lib/slug'

describe('isValidSlug', () => {
  it('接受 URL 安全的小写串', () => {
    expect(isValidSlug('bandwagonhost')).toBe(true)
    expect(isValidSlug('cn-optimized')).toBe(true)
    expect(isValidSlug('bandwagonhost-cn2-gia-e-dc6-review')).toBe(true)
    expect(isValidSlug('a1')).toBe(true)
  })

  it('拒绝大写、空格、下划线、连续/首尾连字符及其它符号', () => {
    expect(isValidSlug('My-Provider')).toBe(false)
    expect(isValidSlug('my provider')).toBe(false)
    expect(isValidSlug('my_provider')).toBe(false)
    expect(isValidSlug('-leading')).toBe(false)
    expect(isValidSlug('trailing-')).toBe(false)
    expect(isValidSlug('double--hyphen')).toBe(false)
    expect(isValidSlug('slash/slug')).toBe(false)
    expect(isValidSlug('中文')).toBe(false)
    expect(isValidSlug('')).toBe(false)
  })
})

describe('validateSlug · Payload 字段校验', () => {
  it('合法 slug 返回 true', () => {
    expect(validateSlug('digitalocean')).toBe(true)
  })

  it('空值与非字符串返回错误信息', () => {
    expect(validateSlug('')).toMatch(/不能为空/)
    expect(validateSlug(undefined)).toMatch(/不能为空/)
    expect(validateSlug(null)).toMatch(/不能为空/)
  })

  it('格式非法返回带示例的错误信息', () => {
    expect(validateSlug('My Provider')).toMatch(/小写字母/)
  })
})

describe('slugify · 生成 URL 安全 slug', () => {
  it('转小写、空格/符号折叠成单连字符', () => {
    expect(slugify('Hello World')).toBe('hello-world')
    expect(slugify('UPPER')).toBe('upper')
    expect(slugify('Foo!!!Bar')).toBe('foo-bar')
    expect(slugify('  Multiple   Spaces  ')).toBe('multiple-spaces')
  })
  it('去掉首尾连字符,保留内部已有连字符', () => {
    expect(slugify('BandwagonHost CN2 GIA-E DC6 实测')).toBe('bandwagonhost-cn2-gia-e-dc6')
  })
  it('纯中文/空/非串得到空串', () => {
    expect(slugify('纯中文标题')).toBe('')
    expect(slugify('')).toBe('')
    expect(slugify(null)).toBe('')
    expect(slugify(undefined)).toBe('')
  })
})

describe('autoSlug · slug 字段 beforeValidate', () => {
  it('已有人工值则原样保留(去首尾空白)', () => {
    expect(autoSlug('my-slug', '标题')).toBe('my-slug')
    expect(autoSlug('  keep-me  ', 'X')).toBe('keep-me')
  })
  it('空值则按来源字段生成', () => {
    expect(autoSlug('', 'Hello World')).toBe('hello-world')
    expect(autoSlug(undefined, 'DigitalOcean')).toBe('digitalocean')
    expect(autoSlug('   ', 'Auto Fill')).toBe('auto-fill') // 纯空白视为空
  })
  it('来源也无 ASCII 时回空,交由 required 校验提示', () => {
    expect(autoSlug('', '纯中文名称')).toBe('')
    expect(autoSlug(null, null)).toBe('')
  })
})
