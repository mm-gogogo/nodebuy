import { describe, it, expect } from 'vitest'
import { networkRows, sortNetwork, type NetReviewLike } from '@/lib/network'

const reviews: NetReviewLike[] = [
  {
    slug: 'a', title: 'A', providerName: 'P1',
    benchmarks: { speedtests: [
      { node: '上海电信', downloadMbps: 2310, uploadMbps: 980, latencyMs: 132 },
      { node: '北京联通', downloadMbps: 1860, uploadMbps: 940, latencyMs: 141 },
    ] },
  },
  {
    slug: 'b', title: 'B', providerName: 'P2',
    benchmarks: { speedtests: [{ node: '广州移动', downloadMbps: 3200, latencyMs: 160 }] },
  },
  {
    slug: 'c', title: 'C', providerName: 'P3',
    benchmarks: { speedtests: [{ node: 'x', latencyMs: 90 }] }, // 仅延迟
  },
  { slug: 'd', title: 'D', providerName: 'P4', benchmarks: { speedtests: [] } }, // 空 → 排除
  { slug: 'e', title: 'E', providerName: 'P5', benchmarks: null }, // 无 → 排除
]

describe('networkRows', () => {
  it('归约为每篇的最佳下载/最低延迟,排除无测速', () => {
    const rows = networkRows(reviews)
    expect(rows.map((r) => r.slug)).toEqual(['a', 'b', 'c'])
    const a = rows.find((r) => r.slug === 'a')!
    expect(a.maxDownload).toBe(2310) // 多节点取最大
    expect(a.minLatency).toBe(132) // 多节点取最小
    expect(a.maxUpload).toBe(980)
    expect(a.nodeCount).toBe(2)
  })
  it('仅延迟也保留,下载为 null', () => {
    const c = networkRows(reviews).find((r) => r.slug === 'c')!
    expect(c.maxDownload).toBeNull()
    expect(c.minLatency).toBe(90)
  })
})

describe('sortNetwork', () => {
  const rows = networkRows(reviews)
  it('按最佳下载降序(缺项末尾)', () => {
    // 下载:b=3200, a=2310, c=null
    expect(sortNetwork(rows, 'download').map((r) => r.slug)).toEqual(['b', 'a', 'c'])
  })
  it('按最低延迟升序(缺项末尾)', () => {
    // 延迟:c=90, a=132, b=160
    expect(sortNetwork(rows, 'latency').map((r) => r.slug)).toEqual(['c', 'a', 'b'])
  })
  it('不修改原数组', () => {
    const before = rows.map((r) => r.slug)
    sortNetwork(rows, 'latency')
    expect(rows.map((r) => r.slug)).toEqual(before)
  })
})
