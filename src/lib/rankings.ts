// 取榜单第一名(榜首)的服务商,用于榜单列表的预览。纯函数,便于单测。
// items 数组顺序即名次,第 0 项为榜首;关联在 depth>=1 时被填充为对象。

export interface LeaderProvider {
  name: string
  slug: string
  brandColor?: string | null
}

interface RankingItemMaybe {
  provider?: number | string | { name?: string; slug?: string; brandColor?: string | null } | null
}

export function rankingLeader(ranking: { items?: RankingItemMaybe[] | null }): LeaderProvider | null {
  const first = (ranking.items || [])[0]
  const p = first?.provider
  if (p && typeof p === 'object' && typeof p.name === 'string' && typeof p.slug === 'string') {
    return { name: p.name, slug: p.slug, brandColor: p.brandColor ?? null }
  }
  return null
}
