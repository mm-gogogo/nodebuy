import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'

import { PlanGuide } from '@/components/PlanGuide'
import type { PlanItem } from '@/lib/planBrowse'

export const revalidate = 60

export const metadata = {
  title: '选购助手',
  description: '不懂线路也没关系:选预算、内存和是否要大陆优化,直接给你最划算的在售套餐。',
}

export default async function GuidePage() {
  const payload = await getPayload({ config })
  const plans = await payload.find({ collection: 'plans', limit: 1000 })

  const items: PlanItem[] = plans.docs.map((p) => {
    const provider = typeof p.provider === 'object' ? p.provider : null
    return {
      id: p.id as number,
      name: p.name,
      providerName: provider?.name || '—',
      providerSlug: provider?.slug || '',
      brandColor: provider?.brandColor,
      cpuCores: p.cpuCores,
      ramMB: p.ramMB,
      storageGB: p.storageGB,
      storageType: p.storageType,
      trafficTB: p.trafficTB,
      route: p.route,
      location: p.location,
      priceMonthly: p.priceMonthly,
      priceYearly: p.priceYearly,
      inStock: p.inStock !== false,
    }
  })

  return (
    <div className="wrap">
      <header className="masthead">
        <h1>选购助手</h1>
        <p className="lede">不懂线路也没关系:选预算、内存,需要的话勾上「大陆优化」,直接给你最划算的在售套餐。</p>
      </header>
      <section className="rail--tight">
        {items.length === 0 ? <p className="empty-note">暂无在售套餐。</p> : <PlanGuide items={items} />}
      </section>
    </div>
  )
}
