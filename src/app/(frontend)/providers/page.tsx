import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'

import { ProviderFilter } from '@/components/ProviderFilter'
import type { ProviderItem } from '@/lib/providerFilter'

export const revalidate = 60

export const metadata = {
  title: '收录服务商',
  description: '按综合评分排序的全部收录服务商，含机房分布、大陆优化线路与在售套餐数，支持搜索与筛选。',
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

  // 只把客户端筛选需要的字段传过去，避免序列化整份文档
  const items: ProviderItem[] = providers.docs.map((p) => ({
    id: p.id as number,
    name: p.name,
    slug: p.slug,
    brandColor: p.brandColor,
    tagline: p.tagline,
    headquarters: p.headquarters,
    overallScore: p.overallScore,
    datacenterCount: p.datacenters?.length || 0,
    cnOptimized: (p.datacenters || []).some((dc) => dc.cnOptimized),
    planCount: planCounts.get(p.id) || 0,
  }))

  return (
    <div className="wrap">
      <header className="masthead">
        <h1>收录服务商</h1>
        <p className="lede">
          按综合评分排序。评分来自实测：性能、网络、性价比、售后四项加权，没测过的不打分、不进榜。
        </p>
      </header>
      <section className="rail--tight">
        {items.length === 0 ? (
          <p className="empty-note">暂未收录服务商。</p>
        ) : (
          <ProviderFilter items={items} />
        )}
      </section>
    </div>
  )
}
