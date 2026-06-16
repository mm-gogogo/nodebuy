// 收藏的纯逻辑(标识符列表,服务商存 slug、套餐存 String(id));localStorage 读写在客户端 hook 里。

export const FAVORITES_KEY = 'nodebuy:favorites' // 服务商收藏(slug)
export const PLAN_FAVORITES_KEY = 'nodebuy:fav-plans' // 套餐收藏(String(id))

export function parseFavorites(raw: string | null | undefined): string[] {
  if (!raw) return []
  try {
    const v = JSON.parse(raw)
    if (Array.isArray(v)) {
      // 去重并只保留字符串
      return [...new Set(v.filter((x): x is string => typeof x === 'string' && x.length > 0))]
    }
    return []
  } catch {
    return []
  }
}

export function serializeFavorites(slugs: string[]): string {
  return JSON.stringify([...new Set(slugs)])
}

export function hasFavorite(slugs: string[], slug: string): boolean {
  return slugs.includes(slug)
}

export function toggleFavorite(slugs: string[], slug: string): string[] {
  return slugs.includes(slug) ? slugs.filter((s) => s !== slug) : [...slugs, slug]
}
