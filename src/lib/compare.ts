import { ramLabel, routeLabels, storageTypeLabels } from './labels'

export const MAX_COMPARE = 4

// 解析 /compare?plans=1,2,3 的 id 列表:去重、去非法、保序、限量。纯函数。
export function parsePlanIds(param: string | null | undefined, max = MAX_COMPARE): number[] {
  if (!param) return []
  const seen = new Set<number>()
  const out: number[] = []
  for (const part of param.split(',')) {
    const n = Number(part.trim())
    if (Number.isInteger(n) && n > 0 && !seen.has(n)) {
      seen.add(n)
      out.push(n)
      if (out.length >= max) break
    }
  }
  return out
}

export interface ComparePlan {
  id: number
  name: string
  providerName: string
  providerSlug: string
  cpuCores?: number | null
  ramMB?: number | null
  storageGB?: number | null
  storageType?: string | null
  trafficTB?: number | null
  route?: string | null
  location?: string | null
  priceMonthly?: number | null
  priceYearly?: number | null
  inStock: boolean
}

export interface CompareRow {
  label: string
  values: string[]
  best?: number[] // 该行「最优」的列下标(可并列);仅规格/价格行有,且需存在可比差异
}

// 等效月价:优先月付,否则年付/12,都无则 null。与 planBrowse.effectiveMonthly 同口径。
export function compareMonthly(p: ComparePlan): number | null {
  if (p.priceMonthly != null) return p.priceMonthly
  if (p.priceYearly != null) return p.priceYearly / 12
  return null
}

// 找出一列数值里「最优」的下标:higherBetter=true 取最大,否则取最小。
// 规则:可比项不足两个 → 不高亮;全员相等 → 无信号也不高亮;并列最优全部标记。
export function bestCols(nums: (number | null)[], higherBetter: boolean): number[] {
  const present = nums.flatMap((n, i) => (n != null && Number.isFinite(n) ? [{ n, i }] : []))
  if (present.length < 2) return []
  const opt = present.reduce((a, b) => ((higherBetter ? b.n > a.n : b.n < a.n) ? b : a))
  const winners = present.filter((x) => x.n === opt.n).map((x) => x.i)
  return winners.length === present.length ? [] : winners
}

// 流量比较口径:0=不限流量视为最大(最优);缺失为 null。
const trafficValue = (p: ComparePlan): number | null =>
  p.trafficTB == null ? null : p.trafficTB === 0 ? Number.MAX_SAFE_INTEGER : p.trafficTB

const fmtMonthly = (m: number | null): string =>
  m == null ? '—' : `$${Number.isInteger(m) ? m : m.toFixed(2)}/月`

// 把若干套餐转成对比表的行(属性 × 套餐)。纯函数,便于单测。
// 规格/价格行附带 best(最优列下标),让对比页一眼看出每项谁更强。
export function comparePlanRows(plans: ComparePlan[]): CompareRow[] {
  const col = <T,>(fn: (p: ComparePlan) => T) => plans.map(fn)
  return [
    { label: '服务商', values: col((p) => p.providerName) },
    {
      label: 'vCPU',
      values: col((p) => (p.cpuCores ? `${p.cpuCores} 核` : '—')),
      best: bestCols(col((p) => p.cpuCores ?? null), true),
    },
    {
      label: '内存',
      values: col((p) => ramLabel(p.ramMB)),
      best: bestCols(col((p) => p.ramMB ?? null), true),
    },
    {
      label: '硬盘',
      values: col((p) =>
        p.storageGB ? `${p.storageGB}G ${storageTypeLabels[p.storageType || 'nvme'] || ''}`.trim() : '—',
      ),
      best: bestCols(col((p) => p.storageGB ?? null), true),
    },
    {
      label: '流量',
      values: col((p) => (p.trafficTB == null ? '—' : p.trafficTB === 0 ? '不限' : `${p.trafficTB}T/月`)),
      best: bestCols(col(trafficValue), true),
    },
    { label: '线路', values: col((p) => (p.route ? routeLabels[p.route] || p.route : '—')) },
    { label: '机房', values: col((p) => p.location || '—') },
    {
      label: '等效月价',
      values: col((p) => fmtMonthly(compareMonthly(p))),
      best: bestCols(col(compareMonthly), false),
    },
    { label: '月付', values: col((p) => (p.priceMonthly != null ? `$${p.priceMonthly}` : '—')) },
    { label: '年付', values: col((p) => (p.priceYearly != null ? `$${p.priceYearly}` : '—')) },
    { label: '库存', values: col((p) => (p.inStock ? '有货' : '缺货')) },
  ]
}
