import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'

import { FavoritesList, type FavProvider } from '@/components/FavoritesList'
import { PlanFavoritesList } from '@/components/PlanFavoritesList'
import type { PlanItem } from '@/lib/planBrowse'

export const metadata = { title: '我的收藏' }

export default async function FavoritesPage() {
  const payload = await getPayload({ config })
  const [providers, plans] = await Promise.all([
    payload.find({
      collection: 'providers',
      limit: 500,
      sort: '-overallScore',
      select: { name: true, slug: true, brandColor: true, tagline: true, overallScore: true },
    }),
    payload.find({ collection: 'plans', limit: 1000 }),
  ])

  const providerItems: FavProvider[] = providers.docs.map((p) => ({
    name: p.name,
    slug: p.slug,
    brandColor: p.brandColor,
    tagline: p.tagline,
    overallScore: p.overallScore,
  }))

  const planItems: PlanItem[] = plans.docs.map((p) => {
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
        <h1>我的收藏</h1>
        <p className="lede">收藏只存在你这台设备的浏览器里,不需要登录。在套餐总览点 ♡ 收藏套餐、在服务商页点「♡ 收藏」收藏服务商。</p>
      </header>
      <section className="rail--tight">
        <h2 className="search-group-title">收藏的套餐</h2>
        <PlanFavoritesList items={planItems} />
      </section>
      <section className="rail--tight">
        <h2 className="search-group-title">收藏的服务商</h2>
        <FavoritesList items={providerItems} />
      </section>
    </div>
  )
}
