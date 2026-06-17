import { describe, it, expect } from 'vitest'
import { planRegion, REGION_LABELS, REGIONS } from '@/lib/planRegion'

describe('planRegion', () => {
  it('北美城市 → na', () => {
    expect(planRegion('洛杉矶 DC6')).toBe('na')
    expect(planRegion('圣何塞')).toBe('na')
    expect(planRegion('达拉斯')).toBe('na')
    expect(planRegion('芝加哥')).toBe('na')
    expect(planRegion('旧金山')).toBe('na')
  })
  it('欧洲城市 → eu', () => {
    expect(planRegion('法尔肯施泰因')).toBe('eu')
    expect(planRegion('纽伦堡')).toBe('eu')
    expect(planRegion('斯德哥尔摩')).toBe('eu')
  })
  it('亚太城市(含香港) → apac', () => {
    expect(planRegion('东京')).toBe('apac')
    expect(planRegion('首尔')).toBe('apac')
    expect(planRegion('新加坡')).toBe('apac')
    expect(planRegion('香港 MEGA')).toBe('apac')
    expect(planRegion('香港')).toBe('apac')
  })
  it('中国大陆城市 → cn', () => {
    expect(planRegion('上海')).toBe('cn')
  })
  it('空/未命中 → null', () => {
    expect(planRegion(null)).toBeNull()
    expect(planRegion(undefined)).toBeNull()
    expect(planRegion('')).toBeNull()
    expect(planRegion('火星基地')).toBeNull()
  })
  it('REGIONS 与 REGION_LABELS 覆盖四区', () => {
    expect(REGIONS).toEqual(['na', 'eu', 'apac', 'cn'])
    expect(REGION_LABELS.cn).toBe('中国大陆')
  })
})
