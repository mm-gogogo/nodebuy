'use client'

import React from 'react'
import Link from 'next/link'

import { ProviderMark, ScoreChip } from '@/components/ui'
import { FavoriteButton } from '@/components/FavoriteButton'
import { useFavorites } from '@/components/useFavorites'

export interface FavProvider {
  name: string
  slug: string
  brandColor?: string | null
  tagline?: string | null
  overallScore?: number | null
}

export function FavoritesList({ items }: { items: FavProvider[] }) {
  const { favs } = useFavorites()

  const shown = items.filter((it) => favs.includes(it.slug))
  if (shown.length === 0) {
    return (
      <p className="empty-note">
        还没有收藏。去 <Link href="/providers">服务商</Link> 页点「♡ 收藏」,把心仪的加进来。
      </p>
    )
  }

  // 按收藏顺序展示
  const ordered = favs.map((slug) => shown.find((it) => it.slug === slug)).filter((x): x is FavProvider => Boolean(x))

  return (
    <ul className="provider-index fav-list">
      {ordered.map((p) => (
        <li key={p.slug}>
          <Link href={`/providers/${p.slug}`}>
            <ProviderMark name={p.name} brandColor={p.brandColor} />
            <span className="grow">
              <span className="name">{p.name}</span>
              <span className="sub">{p.tagline || ''}</span>
            </span>
            <ScoreChip score={p.overallScore} />
          </Link>
          <FavoriteButton slug={p.slug} name={p.name} />
        </li>
      ))}
    </ul>
  )
}
