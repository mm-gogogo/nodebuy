import React, { cache } from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'

import { AffButton, ProviderMark, ScoreChip } from '@/components/ui'
import { JsonLd } from '@/components/JsonLd'
import { breadcrumbList } from '@/lib/jsonld'
import { categoryDescriptions, categoryLabels, fmtDate, priceLine, routeLabels, specLine } from '@/lib/labels'

export const revalidate = 60

const getRanking = cache(async (slug: string) => {
  const payload = await getPayload({ config })
  const result = await payload.find({ collection: 'rankings', where: { slug: { equals: slug } }, limit: 1 })
  return result.docs[0] || null
})

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const ranking = await getRanking(slug)
  if (!ranking) return {}
  return {
    title: ranking.title,
    description: ranking.description || categoryDescriptions[ranking.category] || undefined,
    alternates: { canonical: `/rankings/${slug}` },
  }
}

export default async function RankingDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const ranking = await getRanking(slug)
  if (!ranking) notFound()

  const crumbs = breadcrumbList([
    { name: '首页', path: '/' },
    { name: '榜单', path: '/rankings' },
    { name: ranking.title, path: `/rankings/${slug}` },
  ])

  return (
    <div className="wrap">
      <JsonLd data={crumbs} />
      <header className="article-head">
        <h1>{ranking.title}</h1>
        <div className="meta">
          <span>{categoryLabels[ranking.category] || ranking.category}</span>
          <span>更新于 {fmtDate(ranking.updatedAt)}</span>
          <span>{(ranking.items || []).length} 个上榜</span>
        </div>
        {ranking.description ? (
          <p className="lede" style={{ marginTop: 'var(--space-md)', maxWidth: '46em', color: 'var(--color-muted)' }}>
            {ranking.description}
          </p>
        ) : null}
      </header>

      <section className="rail--tight" style={{ paddingTop: 'var(--space-lg)' }}>
        <table className="rank-table">
          <thead>
            <tr>
              <th>#</th>
              <th>服务商</th>
              <th>代表套餐</th>
              <th>价格</th>
              <th>评分</th>
              <th>上榜理由</th>
              <th aria-label="操作"></th>
            </tr>
          </thead>
          <tbody>
            {(ranking.items || []).map((item, i) => {
              const provider = typeof item.provider === 'object' ? item.provider : null
              const plan = typeof item.plan === 'object' ? item.plan : null
              if (!provider) return null
              const price = plan ? priceLine(plan) : null
              return (
                <tr key={item.id || i}>
                  <td className="rank-no">{String(i + 1).padStart(2, '0')}</td>
                  <td>
                    <Link href={`/providers/${provider.slug}`} className="rank-cell-provider">
                      <ProviderMark name={provider.name} brandColor={provider.brandColor} />
                      <span>
                        <span className="name">{provider.name}</span>
                        {plan?.route ? (
                          <>
                            {' '}
                            <span className="badge badge--accent">{routeLabels[plan.route] || plan.route}</span>
                          </>
                        ) : null}
                        {item.bestFor ? <span className="sub" style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--color-neutral)' }}>适合：{item.bestFor}</span> : null}
                      </span>
                    </Link>
                  </td>
                  <td className="spec">{plan ? specLine(plan) : '—'}</td>
                  <td className="price">
                    {price ? (
                      <>
                        <strong>{price.amount}</strong>
                        {price.cycle}
                      </>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>
                    <ScoreChip score={item.score} />
                  </td>
                  <td className="summary">{item.summary}</td>
                  <td>
                    <AffButton slug={provider.slug} planId={plan?.id} label="入手" />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {ranking.methodology ? (
          <p className="rail__note" style={{ marginTop: 'var(--space-lg)' }}>
            评选标准：{ranking.methodology}
          </p>
        ) : null}
      </section>
    </div>
  )
}
