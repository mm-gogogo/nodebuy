import { describe, it, expect } from 'vitest'
import { toggleCapped } from '@/lib/selection'

describe('toggleCapped', () => {
  it('未选则追加(保序)', () => {
    expect(toggleCapped(['a'], 'b', 4)).toEqual(['a', 'b'])
  })
  it('已选则移除', () => {
    expect(toggleCapped(['a', 'b'], 'a', 4)).toEqual(['b'])
  })
  it('达到上限时不再追加', () => {
    expect(toggleCapped(['a', 'b'], 'c', 2)).toEqual(['a', 'b'])
  })
  it('达到上限仍可移除已选', () => {
    expect(toggleCapped(['a', 'b'], 'a', 2)).toEqual(['b'])
  })
  it('不修改原数组', () => {
    const orig = ['a']
    toggleCapped(orig, 'b', 4)
    expect(orig).toEqual(['a'])
  })
  it('支持数字等其它类型', () => {
    expect(toggleCapped([1, 2], 3, 4)).toEqual([1, 2, 3])
  })
})
