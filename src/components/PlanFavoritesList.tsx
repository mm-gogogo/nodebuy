'use client'

import React from 'react'
import Link from 'next/link'

import { AffButton, ProviderMark } from '@/components/ui'
import { FavoriteButton } from '@/components/FavoriteButton'
import { useFavorites } from '@/components/useFavorites'
import { PLAN_FAVORITES_KEY } from '@/lib/favorites'
import { MAX_COMPARE } from '@/lib/compare'
import { priceLine, routeLabels, specLine } from '@/lib/labels'
import type { PlanItem } from '@/lib/planBrowse'

export function PlanFavoritesList({ items }: { items: PlanItem[] }) {
  const { favs } = useFavorites(PLAN_FAVORITES_KEY)

  const shown = items.filter((it) => favs.includes(String(it.id)))
  if (shown.length === 0) {
    return (
      <p className="empty-note">
        还没有收藏套餐。去 <Link href="/plans">套餐总览</Link> 点每行的 ♡ 把心仪的套餐加进来。
      </p>
    )
  }

  // 按收藏顺序展示
  const ordered = favs
    .map((id) => shown.find((it) => String(it.id) === id))
    .filter((x): x is PlanItem => Boolean(x))

  return (
    <>
      {ordered.length >= 2 ? (
        <div className="fav-actions">
          <Link className="btn-ink" href={`/compare?plans=${ordered.slice(0, MAX_COMPARE).map((p) => p.id).join(',')}`}>
            对比已收藏套餐（最多 {MAX_COMPARE} 个）→
          </Link>
        </div>
      ) : null}
      <ul className="plan-browse fav-list">
        {ordered.map((p) => {
          const price = priceLine(p)
          return (
            <li key={p.id}>
              <ProviderMark name={p.providerName} brandColor={p.brandColor} />
              <span className="pb-main">
                <span className="pb-name">{p.name}</span>
                <span className="pb-sub">
                  {p.providerName}
                  {p.location ? ` · ${p.location}` : ''}
                </span>
              </span>
              <span className="pb-spec">{specLine(p)}</span>
              {p.route ? <span className="badge badge--accent">{routeLabels[p.route] || p.route}</span> : null}
              <span className="pb-price">
                <strong>{price.amount}</strong>
                {price.cycle}
              </span>
              <FavoriteButton slug={String(p.id)} name={p.name} storeKey={PLAN_FAVORITES_KEY} compact />
              {p.inStock ? (
                <AffButton slug={p.providerSlug} planId={p.id} label="入手" />
              ) : (
                <span className="oos">缺货</span>
              )}
            </li>
          )
        })}
      </ul>
    </>
  )
}
