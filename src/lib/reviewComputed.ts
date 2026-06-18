import { overallScore, type ReviewScores } from './reviewFilter'

// 后台只读列「综合评分」:性能/网络/性价比/售后四项均值,保留一位小数;无评分→null。
// 复用前台已测的 overallScore(纯函数),仅加显示用的四舍五入。
export function reviewOverallDisplay(scores: unknown): number | null {
  const o = overallScore((scores ?? null) as ReviewScores | null)
  return o == null ? null : Math.round(o * 10) / 10
}

// 后台只读列「数据完整度」:据 benchmarks 是否有 GB5 跑分 / 有测速节点判定。
// 缺数据的测评进不了 /benchmarks、/network 榜——这列帮编辑一眼看出哪些待补。
// 纯字段读取,无 DB 查询(不拖慢前台读取)。
export function reviewDataStatus(benchmarks: unknown): string {
  const b = benchmarks as { gb5Single?: number | null; speedtests?: unknown[] | null } | null | undefined
  const hasBench = typeof b?.gb5Single === 'number'
  const hasSpeed = Array.isArray(b?.speedtests) && b.speedtests.length > 0
  if (hasBench && hasSpeed) return '跑分 · 测速'
  if (hasBench) return '仅跑分'
  if (hasSpeed) return '仅测速'
  return '无数据'
}
