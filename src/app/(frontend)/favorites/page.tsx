import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'

import { FavoritesList, type FavProvider } from '@/components/FavoritesList'

export const metadata = { title: '我的收藏' }

export default async function FavoritesPage() {
  const payload = await getPayload({ config })
  const providers = await payload.find({
    collection: 'providers',
    limit: 500,
    sort: '-overallScore',
    select: { name: true, slug: true, brandColor: true, tagline: true, overallScore: true },
  })

  const items: FavProvider[] = providers.docs.map((p) => ({
    name: p.name,
    slug: p.slug,
    brandColor: p.brandColor,
    tagline: p.tagline,
    overallScore: p.overallScore,
  }))

  return (
    <div className="wrap">
      <header className="masthead">
        <h1>我的收藏</h1>
        <p className="lede">收藏只存在你这台设备的浏览器里,不需要登录。点服务商页的「♡ 收藏」即可增减。</p>
      </header>
      <section className="rail--tight">
        <FavoritesList items={items} />
      </section>
    </div>
  )
}
