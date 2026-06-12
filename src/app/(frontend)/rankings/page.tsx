import React from 'react'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'

import { categoryDescriptions, categoryLabels, fmtDate } from '@/lib/labels'

export const revalidate = 60

export const metadata = { title: '全部榜单' }

export default async function RankingsPage() {
  const payload = await getPayload({ config })
  const rankings = await payload.find({ collection: 'rankings', limit: 50, sort: 'createdAt' })

  return (
    <div className="wrap">
      <header className="masthead">
        <h1>全部榜单</h1>
        <p className="lede">六个口径分开排，互不打架：要稳定走综合，要便宜走年付，回大陆快优先看线路榜。</p>
      </header>
      <section className="rail--tight">
        <ul className="cat-list">
          {rankings.docs.map((r) => (
            <li key={r.id}>
              <Link href={`/rankings/${r.slug}`}>
                <span className="t">{r.title}</span>
                <span className="d">{r.description || categoryDescriptions[r.category] || categoryLabels[r.category]}</span>
                <span className="d">
                  {(r.items || []).length} 个上榜 · 更新于 {fmtDate(r.updatedAt)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
