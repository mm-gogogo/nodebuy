import React from 'react'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'

import { ProviderMark } from '@/components/ui'
import { aggregateByRegion, type RegionProviderInput } from '@/lib/regionAggregate'
import { regionLabels } from '@/lib/labels'

export const revalidate = 60

export const metadata = {
  title: '机房地区',
  description: '按机房所在地区汇总服务商:北美、欧洲、亚太、中国大陆各有谁、谁家大陆优化,按地区挑机房。',
}

export default async function RegionsPage() {
  const payload = await getPayload({ config })
  const providers = await payload.find({
    collection: 'providers',
    limit: 500,
    select: { name: true, slug: true, brandColor: true, datacenters: true },
  })

  const items: RegionProviderInput[] = providers.docs.map((p) => ({
    name: p.name,
    slug: p.slug,
    brandColor: p.brandColor,
    datacenters: p.datacenters,
  }))

  const groups = aggregateByRegion(items)

  return (
    <div className="wrap">
      <header className="masthead">
        <h1>机房地区</h1>
        <p className="lede">
          按机房所在地区看服务商:哪个区域选择多、谁家大陆优化。也可以
          <Link href="/lines"> 按线路总览 </Link>看。
        </p>
      </header>
      <section className="rail--tight">
        {groups.length === 0 ? (
          <p className="empty-note">暂无机房数据。</p>
        ) : (
          <ul className="line-list">
            {groups.map((g) => (
              <li key={g.region}>
                <div className="line-card line-card--static">
                  <span className="line-head">
                    <span className="line-name">{regionLabels[g.region] || g.region}</span>
                    {g.cnOptimizedCount > 0 ? (
                      <span className="badge badge--accent">{g.cnOptimizedCount} 家大陆优化</span>
                    ) : null}
                  </span>
                  <span className="line-stat">
                    {g.providerCount} 家服务商 · {g.cities.length} 个城市
                  </span>
                  <span className="line-providers">
                    {g.providers.map((p) => (
                      <Link key={p.slug} href={`/providers/${p.slug}`} title={p.name}>
                        <ProviderMark name={p.name} brandColor={p.brandColor} />
                      </Link>
                    ))}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
