import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'

import { AffButton, ProviderMark, RailHead, ScoreBars } from '@/components/ui'
import { fmtDate, priceLine, routeLabels, specLine } from '@/lib/labels'

export const revalidate = 60

const regionLabels: Record<string, string> = { na: '北美', eu: '欧洲', apac: '亚太', cn: '中国大陆' }

export default async function ProviderDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const payload = await getPayload({ config })
  const result = await payload.find({ collection: 'providers', where: { slug: { equals: slug } }, limit: 1 })
  const provider = result.docs[0]
  if (!provider) notFound()

  const [plans, reviews] = await Promise.all([
    payload.find({ collection: 'plans', where: { provider: { equals: provider.id } }, limit: 50, sort: 'priceYearly' }),
    payload.find({
      collection: 'reviews',
      where: { and: [{ provider: { equals: provider.id } }, { _status: { equals: 'published' } }] },
      limit: 20,
      sort: '-publishedAt',
    }),
  ])

  const payLabels: Record<string, string> = {
    alipay: '支付宝',
    wechat: '微信支付',
    paypal: 'PayPal',
    card: '信用卡',
    crypto: '加密货币',
    unionpay: '银联',
  }

  return (
    <div className="wrap">
      <header className="article-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
          <ProviderMark name={provider.name} brandColor={provider.brandColor} large />
          <div style={{ minWidth: 0 }}>
            <h1>{provider.name}</h1>
            {provider.tagline ? <p style={{ color: 'var(--color-muted)', marginTop: 'var(--space-2xs)' }}>{provider.tagline}</p> : null}
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <AffButton slug={provider.slug} label="官网直达" />
          </div>
        </div>
        <div className="meta">
          {provider.founded ? <span>成立于 {provider.founded}</span> : null}
          {provider.headquarters ? <span>{provider.headquarters}</span> : null}
          {provider.overallScore != null ? <span>综合评分 {provider.overallScore.toFixed(1)} / 10</span> : null}
          {provider.paymentMethods?.length ? <span>{provider.paymentMethods.map((m) => payLabels[m] || m).join(' · ')}</span> : null}
        </div>
      </header>

      {provider.description ? (
        <section className="prose" style={{ paddingBottom: 'var(--space-md)' }}>
          <p>{provider.description}</p>
        </section>
      ) : null}

      {provider.scores ? (
        <section className="rail--tight" style={{ paddingTop: 0 }}>
          <ScoreBars scores={provider.scores} />
        </section>
      ) : null}

      {(provider.pros?.length || provider.cons?.length) ? (
        <section className="pros-cons">
          <div className="pros">
            <h3>优点</h3>
            <ul>{(provider.pros || []).map((p, i) => <li key={p.id || i}>{p.item}</li>)}</ul>
          </div>
          <div className="cons">
            <h3>缺点</h3>
            <ul>{(provider.cons || []).map((c, i) => <li key={c.id || i}>{c.item}</li>)}</ul>
          </div>
        </section>
      ) : null}

      {provider.datacenters?.length ? (
        <section className="rail">
          <RailHead title="数据中心" />
          <p style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)' }}>
            {provider.datacenters.map((dc, i) => (
              <span className={`badge${dc.cnOptimized ? ' badge--accent' : ''}`} key={dc.id || i}>
                {dc.city}
                {dc.region ? ` · ${regionLabels[dc.region]}` : ''}
                {dc.cnOptimized ? ' · 大陆优化' : ''}
              </span>
            ))}
          </p>
        </section>
      ) : null}

      <section className="rail">
        <RailHead title="在售套餐" />
        <ul className="plan-list">
          {plans.docs.map((plan) => {
            const price = priceLine(plan)
            return (
              <li key={plan.id}>
                <span className="name">{plan.name}</span>
                <span className="spec">{specLine(plan)}</span>
                {plan.route ? <span className="badge badge--accent">{routeLabels[plan.route] || plan.route}</span> : null}
                {plan.location ? <span className="badge">{plan.location}</span> : null}
                <span className="price">
                  <strong>{price.amount}</strong>
                  {price.cycle}
                </span>
                {plan.inStock === false ? (
                  <span className="oos">缺货</span>
                ) : (
                  <AffButton slug={provider.slug} planId={plan.id} label="入手" />
                )}
              </li>
            )
          })}
          {plans.docs.length === 0 ? <p className="empty-note">暂未收录套餐。</p> : null}
        </ul>
      </section>

      {reviews.docs.length ? (
        <section className="rail">
          <RailHead title="相关测评" />
          <div role="list">
            {reviews.docs.map((r) => (
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
