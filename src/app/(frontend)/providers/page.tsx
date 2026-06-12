import React from 'react'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'

import { ProviderMark, ScoreChip } from '@/components/ui'

export const revalidate = 60

export const metadata = {
  title: '收录服务商',
  description: '按综合评分排序的全部收录服务商，含机房分布、大陆优化线路与在售套餐数。',
}

export default async function ProvidersPage() {
  const payload = await getPayload({ config })
  const [providers, plans] = await Promise.all([
    payload.find({ collection: 'providers', limit: 200, sort: '-overallScore' }),
    payload.find({ collection: 'plans', limit: 1000, depth: 0 }),
  ])

  const planCounts = new Map<string | number, number>()
  for (const plan of plans.docs) {
    const pid = typeof plan.provider === 'object' ? plan.provider?.id : plan.provider
    if (pid != null) planCounts.set(pid, (planCounts.get(pid) || 0) + 1)
  }

  return (
    <div className="wrap">
      <header className="masthead">
        <h1>收录服务商</h1>
        <p className="lede">
          按综合评分排序。评分来自实测：性能、网络、性价比、售后四项加权，没测过的不打分、不进榜。
        </p>
      </header>
      <section className="rail--tight">
        <ul className="provider-index">
          {providers.docs.map((p) => {
            const planCount = planCounts.get(p.id) || 0
            const cnOptimized = (p.datacenters || []).some((dc) => dc.cnOptimized)
            return (
              <li key={p.id}>
                <Link href={`/providers/${p.slug}`}>
                  <ProviderMark name={p.name} brandColor={p.brandColor} />
                  <span className="grow">
                    <span className="name">
                      {p.name}
                      {cnOptimized ? <span className="badge badge--accent">大陆优化</span> : null}
                    </span>
                    <span className="sub">{p.tagline || p.headquarters || ''}</span>
                  </span>
                  <span className="facts">
                    {p.datacenters?.length ? <span>{p.datacenters.length} 个机房</span> : null}
                    {planCount ? <span>{planCount} 个在售套餐</span> : null}
                  </span>
                  <ScoreChip score={p.overallScore} />
                </Link>
              </li>
            )
          })}
        </ul>
        {providers.docs.length === 0 ? <p className="empty-note">暂未收录服务商。</p> : null}
      </section>
    </div>
  )
}
