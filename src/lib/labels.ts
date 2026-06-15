export const routeLabels: Record<string, string> = {
  cn2gia: 'CN2 GIA',
  cn2gt: 'CN2 GT',
  cmin2: 'CMIN2',
  '9929': 'CUII 9929',
  '4837': 'CU 4837',
  direct: '普通直连',
  bgp: '国际 BGP',
}

export const categoryLabels: Record<string, string> = {
  overall: '综合推荐',
  value: '性价比',
  'cn-optimized': '大陆优化',
  performance: '高性能',
  storage: '大硬盘存储',
  budget: '廉价年付',
}

export const categoryDescriptions: Record<string, string> = {
  overall: '网络、性能、口碑与价格的加权综合排序',
  value: '同价位规格最足、折扣后单位成本最低的套餐',
  'cn-optimized': 'CN2 GIA / CMIN2 / 9929 等回程优化线路',
  performance: '高主频 CPU、NVMe 与万兆口的性能型机器',
  storage: '每 GB 存储成本最低的大硬盘 / 备份机',
  budget: '年付 30 美元以内still能用的入门小鸡',
}

export const ispLabels: Record<string, string> = {
  ct: '电信',
  cu: '联通',
  cm: '移动',
}

export const regionLabels: Record<string, string> = {
  na: '北美',
  eu: '欧洲',
  apac: '亚太',
  cn: '中国大陆',
}

export const storageTypeLabels: Record<string, string> = { nvme: 'NVMe', ssd: 'SSD', hdd: 'HDD' }

export function ramLabel(mb?: number | null): string {
  if (!mb) return '—'
  return mb >= 1024 ? `${mb / 1024}G` : `${mb}M`
}

export function specLine(plan: {
  cpuCores?: number | null
  ramMB?: number | null
  storageGB?: number | null
  storageType?: string | null
  trafficTB?: number | null
}): string {
  const parts: string[] = []
  if (plan.cpuCores) parts.push(`${plan.cpuCores}C`)
  if (plan.ramMB) parts.push(ramLabel(plan.ramMB))
  if (plan.storageGB) {
    const type = plan.storageType || 'nvme' // 与 Plans 集合的默认值保持一致
    parts.push(`${plan.storageGB}G ${storageTypeLabels[type] || type.toUpperCase()}`)
  }
  if (plan.trafficTB != null) parts.push(plan.trafficTB === 0 ? '不限流量' : `${plan.trafficTB}T/月`)
  return parts.join(' · ')
}

export function priceLine(plan: { priceMonthly?: number | null; priceYearly?: number | null }): {
  amount: string
  cycle: string
} {
  if (plan.priceYearly != null) return { amount: `$${plan.priceYearly}`, cycle: '/年' }
  if (plan.priceMonthly != null) return { amount: `$${plan.priceMonthly}`, cycle: '/月' }
  return { amount: '—', cycle: '' }
}

export function fmtDate(iso?: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  // 用 UTC 取值：日期字段存为当天 00:00 UTC，服务端渲染时若用本地时区，
  // 在 UTC 以西的服务器上会少一天。固定按 UTC 显示编辑当初录入的日期。
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
}
