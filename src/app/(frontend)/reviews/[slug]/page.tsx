import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { RichText } from '@payloadcms/richtext-lexical/react'

import { AffButton, ScoreBars } from '@/components/ui'
import { fmtDate, ispLabels, specLine } from '@/lib/labels'

export const revalidate = 60

export default async function ReviewDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const payload = await getPayload({ config })
  const result = await payload.find({ collection: 'reviews', where: { slug: { equals: slug } }, limit: 1 })
  const review = result.docs[0]
  if (!review) notFound()

  const provider = typeof review.provider === 'object' ? review.provider : null
  const plan = typeof review.plan === 'object' ? review.plan : null
  const bench = review.benchmarks

  return (
    <div className="wrap">
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

        {bench && (bench.gb5Single || bench.diskReadMBs) ? (
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
    </div>
  )
}
