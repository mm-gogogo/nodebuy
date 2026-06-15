import type { Payload, Where } from 'payload'

// 跨集合全站搜索。

// 纯函数:把若干字段拼成「任一字段 like 关键词」的 where 子句,便于单测。
export function likeAny(fields: string[], term: string): Where {
  return { or: fields.map((f) => ({ [f]: { like: term } })) }
}

const PER_GROUP = 8

export interface SearchResults {
  term: string
  providers: Array<{ id: number | string; name: string; slug: string; tagline?: string | null; brandColor?: string | null; overallScore?: number | null }>
  reviews: Array<{ id: number | string; title: string; slug: string; publishedAt?: string | null }>
  plans: Array<{ id: number | string; name: string; provider?: unknown }>
  rankings: Array<{ id: number | string; title: string; slug: string }>
  total: number
}

export async function searchAll(payload: Payload, rawTerm: string): Promise<SearchResults> {
  const term = rawTerm.trim()
  const empty: SearchResults = { term, providers: [], reviews: [], plans: [], rankings: [], total: 0 }
  if (!term) return empty

  const [providers, reviews, plans, rankings] = await Promise.all([
    payload.find({ collection: 'providers', where: likeAny(['name', 'tagline'], term), limit: PER_GROUP }),
    payload.find({
      collection: 'reviews',
      where: { and: [{ _status: { equals: 'published' } }, likeAny(['title'], term)] },
      limit: PER_GROUP,
      sort: '-publishedAt',
    }),
    payload.find({ collection: 'plans', where: likeAny(['name', 'location'], term), limit: PER_GROUP }),
    payload.find({ collection: 'rankings', where: likeAny(['title'], term), limit: PER_GROUP }),
  ])

  const results: SearchResults = {
    term,
    providers: providers.docs as SearchResults['providers'],
    reviews: reviews.docs as SearchResults['reviews'],
    plans: plans.docs as SearchResults['plans'],
    rankings: rankings.docs as SearchResults['rankings'],
    total: providers.docs.length + reviews.docs.length + plans.docs.length + rankings.docs.length,
  }
  return results
}
