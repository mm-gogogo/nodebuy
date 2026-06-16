'use client'

import { useCallback, useSyncExternalStore } from 'react'

import { FAVORITES_KEY, parseFavorites, serializeFavorites, toggleFavorite } from '@/lib/favorites'

// 用 useSyncExternalStore 订阅 localStorage(外部存储),天然处理 SSR 与跨标签同步,
// 无需在 effect 里 setState。可传不同 key 管理多类收藏(服务商 / 套餐)。
const CHANGE_EVENT = 'nodebuy:favchange'
const SERVER_SNAPSHOT: string[] = []

// 按 key 缓存「raw → 解析结果」,保证未变化时返回同一引用(避免无限重渲染),且各 key 互不干扰。
const caches = new Map<string, { raw: string | null; value: string[] }>()

function snapshotFor(key: string): string[] {
  const raw = localStorage.getItem(key)
  const cached = caches.get(key)
  if (!cached || cached.raw !== raw) {
    const value = parseFavorites(raw)
    caches.set(key, { raw, value })
    return value
  }
  return cached.value
}

function getServerSnapshot(): string[] {
  return SERVER_SNAPSHOT
}

function subscribe(cb: () => void): () => void {
  window.addEventListener('storage', cb)
  window.addEventListener(CHANGE_EVENT, cb)
  return () => {
    window.removeEventListener('storage', cb)
    window.removeEventListener(CHANGE_EVENT, cb)
  }
}

export function useFavorites(key: string = FAVORITES_KEY) {
  const getSnapshot = useCallback(() => snapshotFor(key), [key])
  const favs = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const toggle = useCallback(
    (id: string) => {
      const next = toggleFavorite(snapshotFor(key), id)
      try {
        localStorage.setItem(key, serializeFavorites(next))
      } catch {
        // 隐私模式下 localStorage 可能不可用,忽略
      }
      // storage 事件不在当前标签触发,手动广播让本页订阅者刷新
      window.dispatchEvent(new Event(CHANGE_EVENT))
    },
    [key],
  )

  return { favs, toggle }
}
