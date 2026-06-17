import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

import { describe, it, beforeAll, expect } from 'vitest'
import {
  validatePositive,
  validateNonNegative,
  validatePrice,
  validateMonthlyPrice,
} from '@/lib/planValidation'

describe('validatePositive', () => {
  it('有值则必须 > 0', () => {
    expect(validatePositive(5)).toBe(true)
    expect(validatePositive(0)).toMatch(/大于 0/)
    expect(validatePositive(-1)).toMatch(/大于 0/)
  })
  it('空值放行(交给 required),非数字报错', () => {
    expect(validatePositive(null)).toBe(true)
    expect(validatePositive(undefined)).toBe(true)
    expect(validatePositive('x')).toMatch(/数字/)
    expect(validatePositive(NaN)).toMatch(/数字/)
  })
})

describe('validateNonNegative', () => {
  it('0 与正数放行,负数报错', () => {
    expect(validateNonNegative(0)).toBe(true)
    expect(validateNonNegative(5)).toBe(true)
    expect(validateNonNegative(-1)).toMatch(/不能为负/)
  })
  it('空值放行,非数字报错', () => {
    expect(validateNonNegative(null)).toBe(true)
    expect(validateNonNegative('x')).toMatch(/数字/)
  })
})

describe('validatePrice', () => {
  it('月付/年付至少填一个', () => {
    expect(validatePrice(10, undefined)).toBe(true)
    expect(validatePrice(undefined, 50)).toBe(true)
    expect(validatePrice(undefined, undefined)).toMatch(/至少填一个/)
    expect(validatePrice(null, null)).toMatch(/至少填一个/)
  })
  it('本字段有值则必须 > 0', () => {
    expect(validatePrice(0, undefined)).toMatch(/大于 0/)
    expect(validatePrice(-5, 100)).toMatch(/大于 0/)
    expect(validatePrice(10, 100)).toBe(true)
  })
})

describe('validateMonthlyPrice · Payload 形态', () => {
  it('从 siblingData 取年付判断', () => {
    expect(validateMonthlyPrice(10, { siblingData: {} })).toBe(true)
    expect(validateMonthlyPrice(undefined, { siblingData: { priceYearly: 50 } })).toBe(true)
    expect(validateMonthlyPrice(undefined, { siblingData: {} })).toMatch(/至少填一个/)
    expect(validateMonthlyPrice(undefined, {})).toMatch(/至少填一个/)
    expect(validateMonthlyPrice(0, { siblingData: { priceYearly: 50 } })).toMatch(/大于 0/)
  })
})

describe('套餐校验(集成)', () => {
  let payload: Payload
  let providerId: number

  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    const provs = await payload.find({ collection: 'providers', limit: 1 })
    providerId = provs.docs[0].id as number
  })

  const base = () => ({ name: 'VALIDATION TEST PLAN', provider: providerId, cpuCores: 1, ramMB: 1024, storageGB: 20 })

  it('缺月付且缺年付被拒', async () => {
    await expect(payload.create({ collection: 'plans', data: base() })).rejects.toThrow()
  })
  it('非正 vCPU 被拒', async () => {
    await expect(
      payload.create({ collection: 'plans', data: { ...base(), cpuCores: -1, priceMonthly: 5 } }),
    ).rejects.toThrow()
  })
  it('负流量被拒', async () => {
    await expect(
      payload.create({ collection: 'plans', data: { ...base(), trafficTB: -3, priceMonthly: 5 } }),
    ).rejects.toThrow()
  })
  it('合法套餐可创建(仅年付也行)', async () => {
    const created = await payload.create({ collection: 'plans', data: { ...base(), priceYearly: 60 } })
    expect(created.id).toBeDefined()
    await payload.delete({ collection: 'plans', id: created.id })
  })
})
