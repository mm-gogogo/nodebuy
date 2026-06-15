import { filterSortPlans, type PlanItem } from './planBrowse'

// 选购助手:把用户的简单偏好映射到筛选 + 按性价比(每 G 内存)排序,给出 top N 推荐。
// 复用 filterSortPlans 的纯逻辑,自身亦为纯函数,便于单测。

// 大陆优化线路(回程对大陆友好)
export const CN_OPTIMIZED_ROUTES = ['cn2gia', 'cn2gt', 'cmin2', '9929']

export interface GuidePrefs {
  maxMonthly: number | null // 月预算上限,null=不限
  minRamMB: number // 内存下限,0=不限
  cnOptimized: boolean // 是否要求大陆优化线路
}

export function recommendPlans(items: PlanItem[], prefs: GuidePrefs, topN = 6): PlanItem[] {
  let result = filterSortPlans(items, {
    query: '',
    route: 'all',
    sort: 'value-ram', // 按每 G 内存最划算排
    inStockOnly: true, // 只推有货的
    maxMonthly: prefs.maxMonthly,
    minRamMB: prefs.minRamMB,
  })
  if (prefs.cnOptimized) {
    result = result.filter((p) => p.route != null && CN_OPTIMIZED_ROUTES.includes(p.route))
  }
  return result.slice(0, topN)
}
