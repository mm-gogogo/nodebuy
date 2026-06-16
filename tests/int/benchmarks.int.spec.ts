import { describe, it, expect } from 'vitest'
import { benchmarkRows, sortBenchmarks, type BenchReviewLike } from '@/lib/benchmarks'

const reviews: BenchReviewLike[] = [
  { slug: 'a', title: 'A', providerName: 'P1', benchmarks: { cpuModel: 'Xeon', gb5Single: 716, gb5Multi: 702, diskReadMBs: 842, diskWriteMBs: 781 } },
  { slug: 'b', title: 'B', providerName: 'P2', benchmarks: { gb5Single: 1042, gb5Multi: 1986, diskReadMBs: 2300, diskWriteMBs: 1900 } },
  { slug: 'c', title: 'C', providerName: 'P3', benchmarks: { gb5Single: 880 } }, // 部分
  { slug: 'd', title: 'D', providerName: 'P4', benchmarks: null }, // 无跑分 → 排除
  { slug: 'e', title: 'E', providerName: 'P5', benchmarks: { cpuModel: 'EPYC' } }, // 仅 CPU,无数值 → 排除
]

describe('benchmarkRows', () => {
  it('只保留至少有一项跑分的测评', () => {
    expect(benchmarkRows(reviews).map((r) => r.slug)).toEqual(['a', 'b', 'c'])
  })
  it('缺项填 null', () => {
    const c = benchmarkRows(reviews).find((r) => r.slug === 'c')!
    expect(c.gb5Single).toBe(880)
    expect(c.gb5Multi).toBeNull()
    expect(c.diskReadMBs).toBeNull()
  })
})

describe('sortBenchmarks', () => {
  const rows = benchmarkRows(reviews)
  it('按 GB5 单核降序,缺项排末尾', () => {
    expect(sortBenchmarks(rows, 'gb5Single').map((r) => r.slug)).toEqual(['b', 'c', 'a'])
  })
  it('按 GB5 多核降序(c 缺该项,排末尾)', () => {
    expect(sortBenchmarks(rows, 'gb5Multi').map((r) => r.slug)).toEqual(['b', 'a', 'c'])
  })
  it('按磁盘读降序', () => {
    expect(sortBenchmarks(rows, 'diskRead').map((r) => r.slug)).toEqual(['b', 'a', 'c'])
  })
  it('不修改原数组', () => {
    const before = rows.map((r) => r.slug)
    sortBenchmarks(rows, 'diskWrite')
    expect(rows.map((r) => r.slug)).toEqual(before)
  })
})
