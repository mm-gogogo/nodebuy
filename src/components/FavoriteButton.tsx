'use client'

import React from 'react'

import { useFavorites } from '@/components/useFavorites'

// id:收藏标识(服务商=slug,套餐=String(id));storeKey:不同收藏库;compact:行内只显爱心。
export function FavoriteButton({
  slug,
  name,
  storeKey,
  compact,
}: {
  slug: string
  name: string
  storeKey?: string
  compact?: boolean
}) {
  const { favs, toggle } = useFavorites(storeKey)
  // SSR 快照为空 → 首帧按未收藏渲染(与服务端一致),hydration 后反映真实状态
  const on = favs.includes(slug)
  return (
    <button
      type="button"
      className={`fav-btn${compact ? ' fav-btn--compact' : ''}${on ? ' is-on' : ''}`}
      aria-pressed={on}
      aria-label={on ? `取消收藏 ${name}` : `收藏 ${name}`}
      onClick={() => toggle(slug)}
    >
      {compact ? (on ? '♥' : '♡') : on ? '♥ 已收藏' : '♡ 收藏'}
    </button>
  )
}
