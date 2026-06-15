import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'

import { PlanBrowser } from '@/components/PlanBrowser'
import type { PlanItem } from '@/lib/planBrowse'
import { readPlanQuery } from '@/lib/planQuery'

export const revalidate = 60

export const metadata = {
  title: '套餐总览',
  description: '跨服务商浏览全部在售套餐，按线路筛选、按价格或内存排序，一处对比规格与价格。',
}

export default async function PlansPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const initial = readPlanQuery(await searchParams)
  const payload = await getPayload({ config })
  const plans = await payload.find({ collection: 'plans', limit: 1000, sort: 'priceYearly' })

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
        <h1>套餐总览</h1>
        <p className="lede">把各家在售套餐放到一起比：按线路筛、按价格或内存排，看准规格再点进服务商下单。</p>
      </header>
      <section className="rail--tight">
        {items.length === 0 ? (
          <p className="empty-note">暂无在售套餐。</p>
        ) : (
          <PlanBrowser items={items} initial={initial} />
        )}
      </section>
    </div>
  )
}
