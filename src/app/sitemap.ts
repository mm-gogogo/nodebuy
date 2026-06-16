import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'

const siteUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config })

  const [providers, reviews, rankings] = await Promise.all([
    payload.find({ collection: 'providers', limit: 1000, depth: 0, select: { slug: true, updatedAt: true } }),
    payload.find({
      collection: 'reviews',
      limit: 1000,
      depth: 0,
      where: { _status: { equals: 'published' } },
      select: { slug: true, updatedAt: true },
    }),
    payload.find({ collection: 'rankings', limit: 1000, depth: 0, select: { slug: true, updatedAt: true } }),
  ])

  const statics: MetadataRoute.Sitemap = ['', '/guide', '/rankings', '/reviews', '/benchmarks', '/plans', '/lines', '/regions', '/providers', '/deals'].map((path) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: 'daily',
    priority: path === '' ? 1 : 0.8,
  }))

  const docs = (collection: { docs: Array<{ slug?: string | null; updatedAt?: string }> }, prefix: string) =>
    collection.docs
      .filter((d) => d.slug)
      .map((d) => ({
        url: `${siteUrl}/${prefix}/${d.slug}`,
        lastModified: d.updatedAt ? new Date(d.updatedAt) : undefined,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }))

  return [...statics, ...docs(providers, 'providers'), ...docs(reviews, 'reviews'), ...docs(rankings, 'rankings')]
}
