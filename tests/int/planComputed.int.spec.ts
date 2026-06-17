import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

import { describe, it, beforeAll, expect } from 'vitest'
import { effectiveMonthlyDisplay } from '@/lib/planComputed'

describe('effectiveMonthlyDisplay', () => {
  it('优先月付', () => {
    expect(effectiveMonthlyDisplay(5, 60)).toBe(5)
    expect(effectiveMonthlyDisplay(7.5, null)).toBe(7.5)
  })
  it('无月付则年付/12,两位四舍五入', () => {
    expect(effectiveMonthlyDisplay(null, 60)).toBe(5)
    expect(effectiveMonthlyDisplay(undefined, 169.99)).toBe(14.17) // 14.1658… → 14.17
  })
  it('都无或非数字则 null', () => {
    expect(effectiveMonthlyDisplay(null, null)).toBeNull()
    expect(effectiveMonthlyDisplay('x', 'y')).toBeNull()
    expect(effectiveMonthlyDisplay(undefined, undefined)).toBeNull()
  })
})

describe('effMonthly 只读计算列(集成)', () => {
  let payload: Payload
  let providerId: number

  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    const provs = await payload.find({ collection: 'providers', limit: 1 })
    providerId = provs.docs[0].id as number
  })

  const base = () => ({ name: 'EFFMONTHLY TEST PLAN', provider: providerId, cpuCores: 1, ramMB: 1024, storageGB: 20 })

  it('仅年付时按 年付/12 自动算出', async () => {
    const created = await payload.create({ collection: 'plans', data: { ...base(), priceYearly: 60 } })
    expect(created.effMonthly).toBe(5)
    // 读取(find)同样填充虚拟列
    const read = await payload.findByID({ collection: 'plans', id: created.id })
    expect(read.effMonthly).toBe(5)
    await payload.delete({ collection: 'plans', id: created.id })
  })

  it('有月付时直接用月付', async () => {
    const created = await payload.create({ collection: 'plans', data: { ...base(), priceMonthly: 7.5 } })
    expect(created.effMonthly).toBe(7.5)
    await payload.delete({ collection: 'plans', id: created.id })
  })
})
