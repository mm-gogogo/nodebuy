import { describe, it, expect } from 'vitest'
import { isValidSlug, validateSlug } from '@/lib/slug'

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
