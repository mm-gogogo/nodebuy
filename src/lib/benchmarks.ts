// 把各篇测评的跑分数据抽成可横向比较的排行(纯函数,便于单测)。

export interface BenchReviewLike {
  slug: string
  title: string
  providerName: string
  benchmarks?: {
    cpuModel?: string | null
    gb5Single?: number | null
    gb5Multi?: number | null
    diskReadMBs?: number | null
    diskWriteMBs?: number | null
  } | null
}

export interface BenchRow {
  slug: string
  title: string
  providerName: string
  cpuModel: string | null
  gb5Single: number | null
  gb5Multi: number | null
  diskReadMBs: number | null
  diskWriteMBs: number | null
}

export type BenchSort = 'gb5Single' | 'gb5Multi' | 'diskRead' | 'diskWrite'

// 只保留至少有一项跑分的测评。
export function benchmarkRows(reviews: BenchReviewLike[]): BenchRow[] {
  const out: BenchRow[] = []
  for (const r of reviews) {
    const b = r.benchmarks
    if (!b) continue
    const hasAny =
      b.gb5Single != null || b.gb5Multi != null || b.diskReadMBs != null || b.diskWriteMBs != null
    if (!hasAny) continue
    out.push({
      slug: r.slug,
      title: r.title,
      providerName: r.providerName,
      cpuModel: b.cpuModel ?? null,
      gb5Single: b.gb5Single ?? null,
      gb5Multi: b.gb5Multi ?? null,
      diskReadMBs: b.diskReadMBs ?? null,
      diskWriteMBs: b.diskWriteMBs ?? null,
    })
  }
  return out
}

function metric(r: BenchRow, key: BenchSort): number | null {
  switch (key) {
    case 'gb5Single':
      return r.gb5Single
    case 'gb5Multi':
      return r.gb5Multi
    case 'diskRead':
      return r.diskReadMBs
    case 'diskWrite':
      return r.diskWriteMBs
  }
}

// 按所选指标降序(越高越好),缺该项的排末尾。
export function sortBenchmarks(rows: BenchRow[], key: BenchSort): BenchRow[] {
  return [...rows].sort((a, b) => (metric(b, key) ?? -Infinity) - (metric(a, key) ?? -Infinity))
}
