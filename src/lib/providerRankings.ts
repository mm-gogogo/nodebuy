// 找出某服务商出现在哪些榜单、排第几名（纯函数,便于单测）。
// rankings 用 depth:0 拉取时,item.provider 为关联 id;数组顺序即名次。

export interface RankingItemLite {
  provider?: number | string | { id: number | string } | null
}
export interface RankingLite {
  slug: string
  title: string
  category: string
  items?: RankingItemLite[] | null
}

export interface RankingAppearance {
  slug: string
  title: string
  category: string
  position: number // 1-based 名次
}

function itemProviderId(item: RankingItemLite): number | string | null {
  const p = item.provider
  if (p == null) return null
  return typeof p === 'object' ? p.id : p
}

export function findProviderRankings(
  rankings: RankingLite[],
  providerId: number | string,
): RankingAppearance[] {
  const out: RankingAppearance[] = []
  for (const r of rankings) {
    const idx = (r.items || []).findIndex((it) => itemProviderId(it) === providerId)
    if (idx >= 0) {
      out.push({ slug: r.slug, title: r.title, category: r.category, position: idx + 1 })
    }
  }
  // 名次靠前的优先展示
  return out.sort((a, b) => a.position - b.position)
}
