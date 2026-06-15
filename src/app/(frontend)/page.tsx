import React from 'react'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'

import { AffButton, ProviderMark, RailHead, ScoreChip } from '@/components/ui'
import { CopyCode } from '@/components/CopyCode'
import { categoryDescriptions, categoryLabels, fmtDate, priceLine, routeLabels, specLine } from '@/lib/labels'
import { activeDealsWhere } from '@/lib/queries'

export const revalidate = 60

export default async function HomePage() {
  const payload = await getPayload({ config })

  const [providers, plans, reviews, rankings, deals] = await Promise.all([
    payload.find({ collection: 'providers', limit: 100, sort: '-overallScore' }),
    // 首页只用套餐总数,不需要套餐列表 —— 用 count 避免拉取并 populate 整个集合
    payload.count({ collection: 'plans' }),
    payload.find({ collection: 'reviews', limit: 7, sort: '-publishedAt', where: { _status: { equals: 'published' } } }),
    payload.find({ collection: 'rankings', limit: 20, sort: 'createdAt' }),
    payload.find({ collection: 'deals', limit: 6, sort: '-featured', where: activeDealsWhere() }),
  ])

  const featuredRanking =
    rankings.docs.find((r) => r.featured) || rankings.docs.find((r) => r.category === 'overall') || rankings.docs[0]
  const [leadReview, ...restReviews] = reviews.docs

  return (
    <div className="wrap">
      {/* —— 定位段，Ecosystem Index 不要 display 巨标题 —— */}
      <header className="masthead">
        <h1>服务器测评、跑分与在售榜单</h1>
        <p className="lede">
          每台机器先跑分、再测回程线路，然后才进榜。榜单按综合、性价比、大陆优化等六个口径分开维护，优惠码与库存随测评同步更新。
        </p>
        <p className="counts">
          <span>
            已收录 <strong>{providers.totalDocs}</strong> 家服务商
          </span>
          <span>
            <strong>{plans.totalDocs}</strong> 个在售套餐
          </span>
          <span>
            <strong>{reviews.totalDocs}</strong> 篇实测报告
          </span>
          <span>
            <strong>{rankings.totalDocs}</strong> 份榜单
          </span>
        </p>
      </header>

      {/* —— Rail 1 · 精选榜单 —— */}
      {featuredRanking ? (
        <section className="rail" aria-labelledby="rail-featured">
          <RailHead title={featuredRanking.title} moreHref={`/rankings/${featuredRanking.slug}`} moreLabel="完整榜单 →" />
          {featuredRanking.description ? <p className="rail__note">{featuredRanking.description}</p> : null}
          <table className="rank-table">
            <thead>
              <tr>
                <th>#</th>
                <th>服务商</th>
                <th>代表套餐</th>
                <th>价格</th>
                <th>评分</th>
                <th aria-label="操作"></th>
              </tr>
            </thead>
            <tbody>
              {(featuredRanking.items || []).slice(0, 5).map((item, i) => {
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
                    <td>
                      <AffButton slug={provider.slug} planId={plan?.id} label="入手" />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </section>
      ) : null}

      {/* —— Rail 2 · 最新测评 —— */}
      <section className="rail" aria-labelledby="rail-reviews">
        <RailHead title="最新测评" moreHref="/reviews" />
        {leadReview ? (
          <Link className="review-lead" href={`/reviews/${leadReview.slug}`}>
            <h3>{leadReview.title}</h3>
            {leadReview.excerpt ? <p>{leadReview.excerpt}</p> : null}
            <span className="review-meta-line">
              <span>{fmtDate(leadReview.publishedAt)}</span>
              {leadReview.benchmarks?.gb5Single ? <span>GB5 单核 {leadReview.benchmarks.gb5Single}</span> : null}
              {leadReview.scores?.network != null ? <span>网络 {leadReview.scores.network.toFixed(1)}</span> : null}
            </span>
          </Link>
        ) : (
          <p className="empty-note">测评正在路上。</p>
        )}
        <div role="list">
          {restReviews.map((r) => (
            <Link role="listitem" className="review-row" key={r.id} href={`/reviews/${r.slug}`}>
              <span className="t">{r.title}</span>
              <span className="meta">{fmtDate(r.publishedAt)}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* —— Rail 3 · 优惠速递 —— */}
      <section className="rail" aria-labelledby="rail-deals">
        <RailHead title="优惠速递" moreHref="/deals" />
        <div role="list">
          {deals.docs.map((d) => {
            const provider = typeof d.provider === 'object' ? d.provider : null
            return (
              <div role="listitem" className="deal-row" key={d.id}>
                <div className="grow">
                  <span className="t">{d.title}</span>
                  {d.discount ? <span className="d">　{d.discount}</span> : null}
                </div>
                {d.code ? <CopyCode code={d.code} /> : null}
                {d.expiresAt ? <span className="exp">截至 {fmtDate(d.expiresAt)}</span> : null}
                {provider ? <AffButton slug={provider.slug} dealId={d.id} label="去下单" /> : null}
              </div>
            )
          })}
          {deals.docs.length === 0 ? <p className="empty-note">暂无在售优惠。</p> : null}
        </div>
      </section>

      {/* —— Rail 4 · 按场景找榜单 —— */}
      <section className="rail" aria-labelledby="rail-cats">
        <RailHead title="按场景找榜单" />
        <ul className="cat-list">
          {rankings.docs.map((r) => (
            <li key={r.id}>
              <Link href={`/rankings/${r.slug}`}>
                <span className="t">{categoryLabels[r.category] || r.title}</span>
                <span className="d">{r.description || categoryDescriptions[r.category] || ''}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* —— Rail 5 · 收录服务商 —— */}
      <section className="rail" aria-labelledby="rail-providers">
        <RailHead title="收录服务商" moreHref="/providers" />
        <ul className="provider-grid">
          {providers.docs.map((p) => (
            <li key={p.id}>
              <Link href={`/providers/${p.slug}`}>
                <ProviderMark name={p.name} brandColor={p.brandColor} />
                <span style={{ minWidth: 0 }}>
                  <span className="name">{p.name}</span>
                  <span className="sub">{p.overallScore != null ? `综合 ${p.overallScore.toFixed(1)}` : p.tagline || ''}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
