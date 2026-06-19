// 据服务商「数据中心」列表汇总一句话机房覆盖,用于后台只读列速览。
// 纯函数:机房数 · 覆盖区域(去重、按 REGIONS 规范顺序)· 大陆优化机房数。
import { REGION_LABELS, REGIONS, type Region } from './planRegion'

type DatacenterLike = { region?: Region | null; cnOptimized?: boolean | null }

export function datacenterCoverage(datacenters: readonly DatacenterLike[] | null | undefined): string {
  if (!datacenters || datacenters.length === 0) return '—'
  const present = new Set(
    datacenters.map((d) => d.region).filter((r): r is Region => !!r && r in REGION_LABELS),
  )
  const regions = REGIONS.filter((r) => present.has(r)).map((r) => REGION_LABELS[r])
  const cnOptimized = datacenters.filter((d) => d.cnOptimized === true).length

  let summary = `${datacenters.length} 机房`
  if (regions.length) summary += ` · ${regions.join('/')}`
  if (cnOptimized > 0) summary += ` · 大陆优化×${cnOptimized}`
  return summary
}
