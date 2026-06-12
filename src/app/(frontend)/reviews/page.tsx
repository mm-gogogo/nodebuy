import React from 'react'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'

import { fmtDate } from '@/lib/labels'

export const revalidate = 60

export const metadata = { title: '全部测评' }

export default async function ReviewsPage() {
  const payload = await getPayload({ config })
  const reviews = await payload.find({
    collection: 'reviews',
    limit: 100,
    sort: '-publishedAt',
    where: { _status: { equals: 'published' } },
  })

  return (
    <div className="wrap">
      <header className="masthead">
        <h1>全部测评</h1>
        <p className="lede">每篇都附完整跑分与三网回程数据，结论只对当时的批次负责——线路会调整，下单前看清日期。</p>
      </header>
      <section className="rail--tight">
        <div role="list">
          {reviews.docs.map((r) => {
            const provider = typeof r.provider === 'object' ? r.provider : null
            return (
              <Link role="listitem" className="review-row" key={r.id} href={`/reviews/${r.slug}`}>
                <span className="t">
                  {r.title}
                  {provider ? <span className="badge" style={{ marginLeft: 'var(--space-xs)' }}>{provider.name}</span> : null}
                </span>
                <span className="meta">{fmtDate(r.publishedAt)}</span>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
