import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'

import { ReviewBrowser } from '@/components/ReviewBrowser'
import type { ReviewItem } from '@/lib/reviewFilter'
import { reviewRowMetrics } from '@/lib/reviewMetrics'
import { readReviewQuery } from '@/lib/reviewQuery'

export const revalidate = 60

export const metadata = { title: '全部测评' }

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const initial = readReviewQuery(await searchParams)
  const payload = await getPayload({ config })
  const reviews = await payload.find({
    collection: 'reviews',
    limit: 200,
    sort: '-publishedAt',
    where: { _status: { equals: 'published' } },
  })

  const items: ReviewItem[] = reviews.docs.map((r) => {
    const provider = typeof r.provider === 'object' ? r.provider : null
    return {
      id: r.id,
      title: r.title,
      slug: r.slug,
      providerName: provider?.name || '—',
      providerSlug: provider?.slug || '',
      publishedAt: r.publishedAt,
      metrics: reviewRowMetrics(r),
    }
  })

  return (
    <div className="wrap">
      <header className="masthead">
        <h1>全部测评</h1>
        <p className="lede">每篇都附完整跑分与三网回程数据,结论只对当时的批次负责——线路会调整,下单前看清日期。</p>
      </header>
      <section className="rail--tight">
        {items.length === 0 ? (
          <p className="empty-note">测评正在路上。</p>
        ) : (
          <ReviewBrowser items={items} initial={initial} />
        )}
      </section>
    </div>
  )
}
