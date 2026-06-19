// 据服务商「数据中心」列表汇总机房覆盖,用于后台只读列与前台对比。纯函数。
import { REGION_LABELS, REGIONS, type Region } from './planRegion'

type DatacenterLike = { region?: Region | null; cnOptimized?: boolean | null }

// 该服务商覆盖到的区域标签:去重、按 REGIONS 规范顺序、忽略缺失/非法区域值。
export function datacenterRegionLabels(datacenters: readonly DatacenterLike[] | null | undefined): string[] {
  if (!datacenters || datacenters.length === 0) return []
  const present = new Set(
    datacenters.map((d) => d.region).filter((r): r is Region => !!r && r in REGION_LABELS),
  )
  return REGIONS.filter((r) => present.has(r)).map((r) => REGION_LABELS[r])
}

// 一句话覆盖:机房数 · 覆盖区域 · 大陆优化机房数。
export function datacenterCoverage(datacenters: readonly DatacenterLike[] | null | undefined): string {
  if (!datacenters || datacenters.length === 0) return '—'
  const regions = datacenterRegionLabels(datacenters)
  const cnOptimized = datacenters.filter((d) => d.cnOptimized === true).length

  let summary = `${datacenters.length} 机房`
  if (regions.length) summary += ` · ${regions.join('/')}`
  if (cnOptimized > 0) summary += ` · 大陆优化×${cnOptimized}`
  return summary
}
