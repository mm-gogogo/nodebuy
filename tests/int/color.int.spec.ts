import { describe, it, expect } from 'vitest'
import { isHexColor, validateHexColor } from '@/lib/color'

describe('isHexColor', () => {
  it('接受 3 位与 6 位 hex', () => {
    expect(isHexColor('#abc')).toBe(true)
    expect(isHexColor('#2b6cb0')).toBe(true)
    expect(isHexColor('#FFF')).toBe(true)
  })

  it('拒绝非法颜色', () => {
    expect(isHexColor('2b6cb0')).toBe(false) // 缺 #
    expect(isHexColor('#xyz')).toBe(false)
    expect(isHexColor('#12345')).toBe(false) // 长度不对
    expect(isHexColor('blue')).toBe(false)
    expect(isHexColor('')).toBe(false)
  })
})

describe('validateHexColor · 可选字段', () => {
  it('留空允许', () => {
    expect(validateHexColor('')).toBe(true)
    expect(validateHexColor(null)).toBe(true)
    expect(validateHexColor(undefined)).toBe(true)
  })

  it('合法 hex 通过', () => {
    expect(validateHexColor('#2b6cb0')).toBe(true)
  })

  it('非法值返回带示例的错误', () => {
    expect(validateHexColor('not-a-color')).toMatch(/十六进制/)
    expect(validateHexColor('#12')).toMatch(/十六进制/)
  })
})
