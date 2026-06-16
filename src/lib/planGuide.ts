import { filterSortPlans, pricePerCore, pricePerGbRam, pricePerGbStorage, type PlanItem } from './planBrowse'
import { pricePerTbTraffic } from './value'

// 选购助手:把用户的「用途 + 预算 + 内存 + 大陆访问」偏好映射到筛选 + 按对应用途的
// 性价比排序,给出 top N 推荐。复用各 pricePerX 纯函数,自身亦为纯函数,便于单测。

// 大陆优化线路(回程对大陆友好)
export const CN_OPTIMIZED_ROUTES = ['cn2gia', 'cn2gt', 'cmin2', '9929']

// 用途:决定按哪种「每单位资源等效月价」排序
//  balanced 通用/建站 → 每 G 内存;traffic 中转/流量 → 每 TB 流量;
//  storage 存储/备份 → 每 G 硬盘;compute 算力 → 每核
export type UseCase = 'balanced' | 'traffic' | 'storage' | 'compute'
export const USE_CASES: UseCase[] = ['balanced', 'traffic', 'storage', 'compute']

export interface GuidePrefs {
  maxMonthly: number | null // 月预算上限,null=不限
  minRamMB: number // 内存下限,0=不限
  cnOptimized: boolean // 是否要求大陆优化线路
  useCase?: UseCase // 用途,缺省 balanced
}

// 各用途的「越小越优」排序键:不限流量(trafficTB=0)记为 -Infinity(最优),
// 缺价/缺资源记为 Infinity(垫底)。
export function useCaseKey(p: PlanItem, useCase: UseCase): number {
  if (useCase === 'traffic') {
    if (p.trafficTB === 0) return -Infinity // 不限流量最优
    const t = pricePerTbTraffic(p)
    return t == null ? Infinity : t
  }
  const fn = useCase === 'storage' ? pricePerGbStorage : useCase === 'compute' ? pricePerCore : pricePerGbRam
  const v = fn(p)
  return Number.isFinite(v) ? v : Infinity
}

// 按用途升序排;用 < 比较以正确处理 ±Infinity(Infinity-Infinity=NaN 会破坏排序)。稳定、不改入参。
export function sortByUseCase(plans: PlanItem[], useCase: UseCase): PlanItem[] {
  return [...plans].sort((a, b) => {
    const ka = useCaseKey(a, useCase)
    const kb = useCaseKey(b, useCase)
    return ka === kb ? 0 : ka < kb ? -1 : 1
  })
}

export function recommendPlans(items: PlanItem[], prefs: GuidePrefs, topN = 6): PlanItem[] {
  // 先用既有筛选(有货 + 预算 + 内存),排序无所谓,稍后按用途重排
  let result = filterSortPlans(items, {
    query: '',
    route: 'all',
    sort: 'value-ram',
    inStockOnly: true,
    maxMonthly: prefs.maxMonthly,
    minRamMB: prefs.minRamMB,
  })
  if (prefs.cnOptimized) {
    result = result.filter((p) => p.route != null && CN_OPTIMIZED_ROUTES.includes(p.route))
  }
  return sortByUseCase(result, prefs.useCase ?? 'balanced').slice(0, topN)
}
