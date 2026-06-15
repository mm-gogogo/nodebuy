'use client'

import React from 'react'

import { useFavorites } from '@/components/useFavorites'

export function FavoriteButton({ slug, name }: { slug: string; name: string }) {
  const { favs, toggle } = useFavorites()
  // SSR 快照为空 → 首帧按未收藏渲染(与服务端一致),hydration 后反映真实状态
  const on = favs.includes(slug)
  return (
    <button
      type="button"
      className={`fav-btn${on ? ' is-on' : ''}`}
      aria-pressed={on}
      aria-label={on ? `取消收藏 ${name}` : `收藏 ${name}`}
      onClick={() => toggle(slug)}
    >
      {on ? '♥ 已收藏' : '♡ 收藏'}
    </button>
  )
}
