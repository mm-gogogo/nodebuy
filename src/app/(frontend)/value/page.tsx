import React from 'react'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'

import { ValueTable } from '@/components/ValueTable'
import { valueRows } from '@/lib/value'
import { effectiveMonthly, type PlanItem } from '@/lib/planBrowse'

export const revalidate = 60

export const metadata = {
  title: '性价比排行',
  description: '把各家在售套餐换算成「每 G 内存 / 每 G 硬盘 / 每 TB 流量」的等效月价排行,一眼看出谁最划算。',
}

export default async function ValuePage() {
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

  // 性价比榜面向「现在能下单的好价」:只取有货且有价的套餐。
  const rows = valueRows(items.filter((p) => p.inStock && Number.isFinite(effectiveMonthly(p))))

  return (
    <div className="wrap">
      <header className="masthead">
        <h1>性价比排行</h1>
        <p className="lede">
          把各家在售套餐换算成等效月价后,按每 G 内存、每 G 硬盘或每 TB 流量排序——按哪个维度排就看哪列,一眼看出谁最划算。也看
          <Link href="/benchmarks"> 跑分排行 </Link>与<Link href="/network"> 三网测速排行 </Link>。
        </p>
      </header>
      <section className="rail--tight">
        {rows.length === 0 ? <p className="empty-note">暂无在售套餐。</p> : <ValueTable rows={rows} />}
      </section>
    </div>
  )
}
