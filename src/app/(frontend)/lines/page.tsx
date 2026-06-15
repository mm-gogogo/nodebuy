import React from 'react'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'

import { ProviderMark } from '@/components/ui'
import { aggregateByRoute, type LinePlan } from '@/lib/lineAggregate'
import { routeLabels } from '@/lib/labels'

export const revalidate = 60

export const metadata = {
  title: '线路总览',
  description: '按回程线路汇总在售套餐:每条线路有多少套餐、多少家服务商、最低多少钱,一页看懂市场格局。',
}

export default async function LinesPage() {
  const payload = await getPayload({ config })
  const plans = await payload.find({ collection: 'plans', limit: 1000 })

  const items: LinePlan[] = plans.docs.map((p) => {
    const provider = typeof p.provider === 'object' ? p.provider : null
    return {
      route: p.route,
      providerName: provider?.name || '—',
      providerSlug: provider?.slug || '',
      brandColor: provider?.brandColor,
      priceMonthly: p.priceMonthly,
      priceYearly: p.priceYearly,
      inStock: p.inStock !== false,
    }
  })

  const groups = aggregateByRoute(items)

  return (
    <div className="wrap">
      <header className="masthead">
        <h1>线路总览</h1>
        <p className="lede">按回程线路汇总在售套餐:哪条线路选择多、谁家在做、最低多少钱,点进去看全部套餐。</p>
      </header>
      <section className="rail--tight">
        {groups.length === 0 ? (
          <p className="empty-note">暂无线路数据。</p>
        ) : (
          <ul className="line-list">
            {groups.map((g) => (
              <li key={g.route}>
                <Link href={`/plans?route=${g.route}`} className="line-card">
                  <span className="line-head">
                    <span className="line-name">{routeLabels[g.route] || g.route}</span>
                    {g.cheapestMonthly != null ? (
                      <span className="line-price">低至 ${Math.round(g.cheapestMonthly * 100) / 100}/月</span>
                    ) : null}
                  </span>
                  <span className="line-stat">
                    {g.planCount} 个套餐 · {g.providerCount} 家服务商
                  </span>
                  <span className="line-providers">
                    {g.providers.slice(0, 6).map((p) => (
                      <ProviderMark key={p.slug} name={p.name} brandColor={p.brandColor} />
                    ))}
                    {g.providers.length > 6 ? <span className="line-more">+{g.providers.length - 6}</span> : null}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
