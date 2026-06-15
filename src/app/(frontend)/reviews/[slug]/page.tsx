import React, { cache } from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { RichText } from '@payloadcms/richtext-lexical/react'

import { AffButton, Breadcrumbs, RailHead, ScoreBars } from '@/components/ui'
import { JsonLd } from '@/components/JsonLd'
import { breadcrumbList } from '@/lib/jsonld'
import { findProviderRankings, type RankingLite } from '@/lib/providerRankings'
import { categoryLabels, fmtDate, ispLabels, specLine } from '@/lib/labels'

export const revalidate = 60

const getReview = cache(async (slug: string) => {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'reviews',
    where: { and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }] },
    limit: 1,
  })
  return result.docs[0] || null
})

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const review = await getReview(slug)
  if (!review) return {}
  return {
    title: review.title,
    description: review.excerpt || review.verdict || undefined,
    alternates: { canonical: `/reviews/${slug}` },
    openGraph: {
      type: 'article',
      title: review.title,
      description: review.excerpt || undefined,
      publishedTime: review.publishedAt,
      modifiedTime: review.updatedAt,
      authors: review.author ? [review.author] : undefined,
    },
  }
}

export default async function ReviewDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const review = await getReview(slug)
  if (!review) notFound()

  const provider = typeof review.provider === 'object' ? review.provider : null
  const plan = typeof review.plan === 'object' ? review.plan : null
  const bench = review.benchmarks

  // 相关内容:同服务商的其他测评 + 该服务商的上榜榜单(强化站内互链)
  const payload = await getPayload({ config })
  const [siblingsRes, rankingsRes] = provider
    ? await Promise.all([
        payload.find({
          collection: 'reviews',
          where: {
            and: [
              { provider: { equals: provider.id } },
              { _status: { equals: 'published' } },
              { id: { not_equals: review.id } },
            ],
          },
          limit: 5,
          sort: '-publishedAt',
        }),
        payload.find({ collection: 'rankings', limit: 50, depth: 0 }),
      ])
    : [null, null]
  const siblings = siblingsRes?.docs ?? []
  const appearances = provider && rankingsRes ? findProviderRankings(rankingsRes.docs as RankingLite[], provider.id) : []

  const scoreValues = [
    review.scores?.performance,
    review.scores?.network,
    review.scores?.value,
    review.scores?.support,
  ].filter((v): v is number => v != null)
  const ratingValue = scoreValues.length
    ? Math.round((scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length) * 10) / 10
    : null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Review',
    headline: review.title,
    description: review.excerpt || undefined,
    datePublished: review.publishedAt,
    dateModified: review.updatedAt,
    author: { '@type': 'Organization', name: review.author || 'NodeBuy' },
    itemReviewed: provider
      ? { '@type': 'Service', name: plan ? `${provider.name} ${plan.name}` : provider.name, provider: { '@type': 'Organization', name: provider.name } }
      : undefined,
    reviewRating:
      ratingValue != null
        ? { '@type': 'Rating', ratingValue, bestRating: 10, worstRating: 0 }
        : undefined,
  }

  const crumbs = [
    { name: '首页', path: '/' },
    { name: '测评', path: '/reviews' },
    { name: review.title, path: `/reviews/${slug}` },
  ]

  return (
    <div className="wrap">
      <JsonLd data={jsonLd} />
      <JsonLd data={breadcrumbList(crumbs)} />
      <Breadcrumbs crumbs={crumbs} />
      <header className="article-head">
        <h1>{review.title}</h1>
        <div className="meta">
          <span>{fmtDate(review.publishedAt)}</span>
          {review.author ? <span>{review.author}</span> : null}
          {review.readingMinutes ? <span>约 {review.readingMinutes} 分钟</span> : null}
          {provider ? <Link href={`/providers/${provider.slug}`}>{provider.name} ↗</Link> : null}
        </div>
      </header>

      <article className="prose">
        {review.excerpt ? <p style={{ fontSize: 'var(--text-md)', color: 'var(--color-muted)' }}>{review.excerpt}</p> : null}

        {plan ? (
          <table className="bench-table">
            <caption>受测套餐</caption>
            <tbody>
              <tr>
                <td className="label">套餐</td>
                <td>{plan.name}</td>
              </tr>
              <tr>
                <td className="label">配置</td>
                <td>{specLine(plan)}</td>
              </tr>
              {plan.location ? (
                <tr>
                  <td className="label">机房</td>
                  <td>{plan.location}</td>
                </tr>
              ) : null}
              {plan.priceYearly != null || plan.priceMonthly != null ? (
                <tr>
                  <td className="label">价格</td>
                  <td>
                    {plan.priceYearly != null ? `$${plan.priceYearly}/年` : ''}
                    {plan.priceYearly != null && plan.priceMonthly != null ? ' · ' : ''}
                    {plan.priceMonthly != null ? `$${plan.priceMonthly}/月` : ''}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        ) : null}

        {review.scores ? (
          <>
            <h2>分项评分</h2>
            <ScoreBars scores={review.scores} />
          </>
        ) : null}

        {bench && (bench.cpuModel || bench.gb5Single || bench.gb5Multi || bench.diskReadMBs || bench.diskWriteMBs) ? (
          <>
            <h2>跑分</h2>
            <table className="bench-table">
              <tbody>
                {bench.cpuModel ? (
                  <tr>
                    <td className="label">CPU</td>
                    <td>{bench.cpuModel}</td>
                  </tr>
                ) : null}
                {bench.gb5Single ? (
                  <tr>
                    <td className="label">Geekbench 5 单核</td>
                    <td>{bench.gb5Single}</td>
                  </tr>
                ) : null}
                {bench.gb5Multi ? (
                  <tr>
                    <td className="label">Geekbench 5 多核</td>
                    <td>{bench.gb5Multi}</td>
                  </tr>
                ) : null}
                {bench.diskReadMBs ? (
                  <tr>
                    <td className="label">磁盘顺序读</td>
                    <td>{bench.diskReadMBs} MB/s</td>
                  </tr>
                ) : null}
                {bench.diskWriteMBs ? (
                  <tr>
                    <td className="label">磁盘顺序写</td>
                    <td>{bench.diskWriteMBs} MB/s</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </>
        ) : null}

        {bench?.speedtests?.length ? (
          <table className="bench-table">
            <caption>三网测速</caption>
            <thead>
              <tr>
                <th>节点</th>
                <th>下载</th>
                <th>上传</th>
                <th>延迟</th>
              </tr>
            </thead>
            <tbody>
              {bench.speedtests.map((s, i) => (
                <tr key={s.id || i}>
                  <td className="label">{s.node}</td>
                  <td>{s.downloadMbps != null ? `${s.downloadMbps} Mbps` : '—'}</td>
                  <td>{s.uploadMbps != null ? `${s.uploadMbps} Mbps` : '—'}</td>
                  <td>{s.latencyMs != null ? `${s.latencyMs} ms` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}

        {bench?.routes?.length ? (
          <table className="bench-table">
            <caption>回程线路</caption>
            <thead>
              <tr>
                <th>运营商</th>
                <th>线路</th>
              </tr>
            </thead>
            <tbody>
              {bench.routes.map((r, i) => (
                <tr key={r.id || i}>
                  <td className="label">{r.isp ? ispLabels[r.isp] : '—'}</td>
                  <td>{r.path}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}

        {review.content ? <RichText data={review.content} /> : null}

        {review.verdict ? <blockquote className="verdict">{review.verdict}</blockquote> : null}

        {provider ? (
          <p style={{ marginTop: 'var(--space-xl)' }}>
            <AffButton slug={provider.slug} planId={plan?.id} label={`${provider.name} 官网直达`} />
          </p>
        ) : null}
      </article>

      {provider && appearances.length ? (
        <section className="rail--tight">
          <p className="ranking-appearances">
            <span className="rail__note" style={{ marginRight: 'var(--space-sm)' }}>
              {provider.name} 上榜
            </span>
            {appearances.map((a) => (
              <Link key={a.slug} href={`/rankings/${a.slug}`} className="ranking-appearance">
                <span className="rank-pos">#{a.position}</span>
                <span>{categoryLabels[a.category] || a.title}</span>
              </Link>
            ))}
          </p>
        </section>
      ) : null}

      {siblings.length ? (
        <section className="rail">
          <RailHead title={`${provider?.name ?? ''} 的其他测评`} moreHref={provider ? `/providers/${provider.slug}` : undefined} />
          <div role="list">
            {siblings.map((r) => (
              <Link role="listitem" className="review-row" key={r.id} href={`/reviews/${r.slug}`}>
                <span className="t">{r.title}</span>
                <span className="meta">{fmtDate(r.publishedAt)}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
