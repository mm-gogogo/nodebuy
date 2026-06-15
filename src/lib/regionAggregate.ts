// 按机房地区聚合服务商(纯函数,便于单测)。给「机房地区」总览页提供数据。

export interface RegionDatacenter {
  city: string
  region?: string | null
  cnOptimized?: boolean | null
}
export interface RegionProviderInput {
  name: string
  slug: string
  brandColor?: string | null
  datacenters?: RegionDatacenter[] | null
}

export interface RegionProvider {
  name: string
  slug: string
  brandColor?: string | null
}
export interface RegionGroup {
  region: string
  providerCount: number
  cnOptimizedCount: number // 在该区域有大陆优化机房的服务商数
  cities: string[] // 该区域出现过的城市(去重)
  providers: RegionProvider[]
}

export function aggregateByRegion(providers: RegionProviderInput[]): RegionGroup[] {
  const groups = new Map<
    string,
    { providers: Map<string, RegionProvider>; cnOpt: Set<string>; cities: Set<string> }
  >()

  for (const p of providers) {
    // 该服务商在每个区域出现一次;记录其在该区域是否有大陆优化机房
    const seenRegions = new Set<string>()
    const cnOptRegions = new Set<string>()
    for (const dc of p.datacenters || []) {
      if (!dc.region) continue
      seenRegions.add(dc.region)
      if (dc.cnOptimized) cnOptRegions.add(dc.region)
      let g = groups.get(dc.region)
      if (!g) {
        g = { providers: new Map(), cnOpt: new Set(), cities: new Set() }
        groups.set(dc.region, g)
      }
      if (dc.city) g.cities.add(dc.city)
    }
    for (const region of seenRegions) {
      const g = groups.get(region)!
      g.providers.set(p.slug, { name: p.name, slug: p.slug, brandColor: p.brandColor ?? null })
      if (cnOptRegions.has(region)) g.cnOpt.add(p.slug)
    }
  }

  const out: RegionGroup[] = []
  for (const [region, g] of groups) {
    out.push({
      region,
      providerCount: g.providers.size,
      cnOptimizedCount: g.cnOpt.size,
      cities: [...g.cities],
      providers: [...g.providers.values()],
    })
  }
  out.sort((a, b) => b.providerCount - a.providerCount || a.region.localeCompare(b.region))
  return out
}
