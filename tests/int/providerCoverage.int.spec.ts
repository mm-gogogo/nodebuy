import { describe, it, expect } from 'vitest'
import { datacenterCoverage, datacenterRegionLabels } from '@/lib/providerCoverage'
import type { Region } from '@/lib/planRegion'

describe('datacenterRegionLabels', () => {
  it('空 / null / undefined 返回空数组', () => {
    expect(datacenterRegionLabels([])).toEqual([])
    expect(datacenterRegionLabels(null)).toEqual([])
    expect(datacenterRegionLabels(undefined)).toEqual([])
  })

  it('去重并按 na/eu/apac/cn 规范顺序', () => {
    const dcs = [{ region: 'apac' as const }, { region: 'na' as const }, { region: 'apac' as const }, { region: 'cn' as const }]
    expect(datacenterRegionLabels(dcs)).toEqual(['北美', '亚太', '中国大陆'])
  })

  it('忽略缺失/非法区域值', () => {
    const dcs = [{ region: null }, { region: undefined }, { region: 'na' as const }, { region: 'mars' as unknown as Region }]
    expect(datacenterRegionLabels(dcs)).toEqual(['北美'])
  })
})

describe('datacenterCoverage', () => {
  it('空 / null / undefined 返回占位符', () => {
    expect(datacenterCoverage([])).toBe('—')
    expect(datacenterCoverage(null)).toBe('—')
    expect(datacenterCoverage(undefined)).toBe('—')
  })

  it('仅机房数(无区域、无大陆优化)', () => {
    expect(datacenterCoverage([{}, {}])).toBe('2 机房')
  })

  it('区域去重并按 na/eu/apac/cn 规范顺序输出', () => {
    const dcs = [
      { region: 'apac' as const },
      { region: 'na' as const },
      { region: 'apac' as const }, // 重复
      { region: 'cn' as const },
    ]
    expect(datacenterCoverage(dcs)).toBe('4 机房 · 北美/亚太/中国大陆')
  })

  it('统计大陆优化机房数', () => {
    const dcs = [
      { region: 'cn' as const, cnOptimized: true },
      { region: 'na' as const, cnOptimized: false },
      { region: 'apac' as const, cnOptimized: true },
    ]
    expect(datacenterCoverage(dcs)).toBe('3 机房 · 北美/亚太/中国大陆 · 大陆优化×2')
  })

  it('单机房 + 大陆优化', () => {
    expect(datacenterCoverage([{ region: 'cn', cnOptimized: true }])).toBe('1 机房 · 中国大陆 · 大陆优化×1')
  })

  it('忽略缺失/非法区域值', () => {
    const dcs = [
      { region: null },
      { region: undefined },
      { region: 'na' as const },
      { region: 'mars' as unknown as Region }, // 故意非法区域值,运行时应被忽略
    ]
    expect(datacenterCoverage(dcs)).toBe('4 机房 · 北美')
  })
})
