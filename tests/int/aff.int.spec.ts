import { describe, it, expect } from 'vitest'
import { normalizeAffUrl, resolveAffTarget } from '@/lib/aff'

describe('resolveAffTarget · AFF 跳转优先级', () => {
  const provider = { affUrl: 'https://provider.example/aff', website: 'https://provider.example' }

  it('无套餐无优惠时用服务商 affUrl', () => {
    expect(resolveAffTarget(provider)).toBe('https://provider.example/aff')
  })

  it('服务商无 affUrl 时回落到官网', () => {
    expect(resolveAffTarget({ website: 'https://provider.example' })).toBe('https://provider.example')
  })

  it('两者都没有时返回 null', () => {
    expect(resolveAffTarget({})).toBeNull()
  })

  it('套餐级 affUrl 覆盖服务商', () => {
    expect(resolveAffTarget(provider, { affUrl: 'https://provider.example/plan' })).toBe(
      'https://provider.example/plan',
    )
  })

  it('优惠级 url 优先级最高，覆盖套餐与服务商', () => {
    expect(
      resolveAffTarget(provider, { affUrl: 'https://provider.example/plan' }, { url: 'https://provider.example/deal' }),
    ).toBe('https://provider.example/deal')
  })

  it('套餐 affUrl 为空时不覆盖服务商', () => {
    expect(resolveAffTarget(provider, { affUrl: null })).toBe('https://provider.example/aff')
  })

  it('优惠 url 为空时回落到套餐 affUrl', () => {
    expect(resolveAffTarget(provider, { affUrl: 'https://provider.example/plan' }, { url: '' })).toBe(
      'https://provider.example/plan',
    )
  })
})

describe('normalizeAffUrl · 出站链接收敛', () => {
  it('已是绝对 https URL 原样返回', () => {
    expect(normalizeAffUrl('https://x.com/aff?a=1')).toBe('https://x.com/aff?a=1')
  })

  it('http 也接受', () => {
    expect(normalizeAffUrl('http://x.com/aff')).toBe('http://x.com/aff')
  })

  it('裸域名补 https://（这是会导致 redirect 500 的关键场景）', () => {
    expect(normalizeAffUrl('bandwagonhost.com/aff?aff=1')).toBe('https://bandwagonhost.com/aff?aff=1')
  })

  it('协议相对 //x 补 https:', () => {
    expect(normalizeAffUrl('//cdn.x.com/go')).toBe('https://cdn.x.com/go')
  })

  it('前后空白被裁剪', () => {
    expect(normalizeAffUrl('  https://x.com/aff  ')).toBe('https://x.com/aff')
  })

  it('非 http(s) 协议返回 null', () => {
    expect(normalizeAffUrl('javascript:alert(1)')).toBeNull()
    expect(normalizeAffUrl('ftp://x.com/f')).toBeNull()
  })

  it('空值返回 null', () => {
    expect(normalizeAffUrl(null)).toBeNull()
    expect(normalizeAffUrl(undefined)).toBeNull()
    expect(normalizeAffUrl('   ')).toBeNull()
  })
})
