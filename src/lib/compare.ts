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
}

// 把若干套餐转成对比表的行(属性 × 套餐)。纯函数,便于单测。
export function comparePlanRows(plans: ComparePlan[]): CompareRow[] {
  const col = <T,>(fn: (p: ComparePlan) => T) => plans.map(fn)
  return [
    { label: '服务商', values: col((p) => p.providerName) },
    { label: 'vCPU', values: col((p) => (p.cpuCores ? `${p.cpuCores} 核` : '—')) },
    { label: '内存', values: col((p) => ramLabel(p.ramMB)) },
    {
      label: '硬盘',
      values: col((p) =>
        p.storageGB ? `${p.storageGB}G ${storageTypeLabels[p.storageType || 'nvme'] || ''}`.trim() : '—',
      ),
    },
    { label: '流量', values: col((p) => (p.trafficTB == null ? '—' : p.trafficTB === 0 ? '不限' : `${p.trafficTB}T/月`)) },
    { label: '线路', values: col((p) => (p.route ? routeLabels[p.route] || p.route : '—')) },
    { label: '机房', values: col((p) => p.location || '—') },
    { label: '月付', values: col((p) => (p.priceMonthly != null ? `$${p.priceMonthly}` : '—')) },
    { label: '年付', values: col((p) => (p.priceYearly != null ? `$${p.priceYearly}` : '—')) },
    { label: '库存', values: col((p) => (p.inStock ? '有货' : '缺货')) },
  ]
}
