// 把各篇测评的三网测速汇成可排序排行(纯函数,便于单测)。
// 每篇测评有多个测速节点,归约为「最佳下载 / 最低延迟」代表其网络上限。

export interface NetReviewLike {
  slug: string
  title: string
  providerName: string
  benchmarks?: {
    speedtests?: Array<{
      node?: string | null
      downloadMbps?: number | null
      uploadMbps?: number | null
      latencyMs?: number | null
    }> | null
  } | null
}

export interface NetRow {
  slug: string
  title: string
  providerName: string
  maxDownload: number | null
  maxUpload: number | null
  minLatency: number | null
  nodeCount: number
}

export type NetSort = 'download' | 'latency'

function maxOf(values: Array<number | null | undefined>): number | null {
  const nums = values.filter((v): v is number => v != null)
  return nums.length ? Math.max(...nums) : null
}
function minOf(values: Array<number | null | undefined>): number | null {
  const nums = values.filter((v): v is number => v != null)
  return nums.length ? Math.min(...nums) : null
}

export function networkRows(reviews: NetReviewLike[]): NetRow[] {
  const out: NetRow[] = []
  for (const r of reviews) {
    const sts = r.benchmarks?.speedtests
    if (!sts || sts.length === 0) continue
    const maxDownload = maxOf(sts.map((s) => s.downloadMbps))
    const minLatency = minOf(sts.map((s) => s.latencyMs))
    // 至少要有下载或延迟之一才纳入
    if (maxDownload == null && minLatency == null) continue
    out.push({
      slug: r.slug,
      title: r.title,
      providerName: r.providerName,
      maxDownload,
      maxUpload: maxOf(sts.map((s) => s.uploadMbps)),
      minLatency,
      nodeCount: sts.length,
    })
  }
  return out
}

export function sortNetwork(rows: NetRow[], key: NetSort): NetRow[] {
  if (key === 'latency') {
    // 延迟越低越好:升序,缺项排末尾
    return [...rows].sort((a, b) => (a.minLatency ?? Infinity) - (b.minLatency ?? Infinity))
  }
  // 下载越高越好:降序,缺项排末尾
  return [...rows].sort((a, b) => (b.maxDownload ?? -Infinity) - (a.maxDownload ?? -Infinity))
}
