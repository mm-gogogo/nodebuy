import { overallScore, type ReviewScores } from './reviewFilter'

// 后台只读列「综合评分」:性能/网络/性价比/售后四项均值,保留一位小数;无评分→null。
// 复用前台已测的 overallScore(纯函数),仅加显示用的四舍五入。
export function reviewOverallDisplay(scores: unknown): number | null {
  const o = overallScore((scores ?? null) as ReviewScores | null)
  return o == null ? null : Math.round(o * 10) / 10
}
