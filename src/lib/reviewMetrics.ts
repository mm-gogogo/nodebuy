// 从测评里抽出适合在列表行内速览的关键指标(纯函数,便于单测)。
// 优先 Geekbench 5 单核 + 网络评分 —— 测评站读者最常据此横向比较。

export interface ReviewLike {
  benchmarks?: { gb5Single?: number | null } | null
  scores?: { network?: number | null } | null
}

export interface RowMetric {
  label: string
  value: string
}

export function reviewRowMetrics(r: ReviewLike): RowMetric[] {
  const out: RowMetric[] = []
  if (r.benchmarks?.gb5Single) out.push({ label: 'GB5', value: String(r.benchmarks.gb5Single) })
  if (r.scores?.network != null) out.push({ label: '网络', value: r.scores.network.toFixed(1) })
  return out
}
