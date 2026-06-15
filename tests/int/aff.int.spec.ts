import { describe, it, expect } from 'vitest'
import { resolveAffTarget } from '@/lib/aff'

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
