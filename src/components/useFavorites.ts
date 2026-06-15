'use client'

import { useCallback, useSyncExternalStore } from 'react'

import { FAVORITES_KEY, parseFavorites, serializeFavorites, toggleFavorite } from '@/lib/favorites'

// 用 useSyncExternalStore 订阅 localStorage(外部存储),天然处理 SSR 与跨标签同步,
// 无需在 effect 里 setState。
const CHANGE_EVENT = 'nodebuy:favchange'
const SERVER_SNAPSHOT: string[] = []

// 按 raw 字符串缓存解析结果,保证未变化时返回同一引用(避免无限重渲染)。
let cachedRaw: string | null = null
let cachedValue: string[] = SERVER_SNAPSHOT

function getSnapshot(): string[] {
  const raw = localStorage.getItem(FAVORITES_KEY)
  if (raw !== cachedRaw) {
    cachedRaw = raw
    cachedValue = parseFavorites(raw)
  }
  return cachedValue
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

export function useFavorites() {
  const favs = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const toggle = useCallback((slug: string) => {
    const next = toggleFavorite(getSnapshot(), slug)
    try {
      localStorage.setItem(FAVORITES_KEY, serializeFavorites(next))
    } catch {
      // 隐私模式下 localStorage 可能不可用,忽略
    }
    // storage 事件不在当前标签触发,手动广播让本页订阅者刷新
    window.dispatchEvent(new Event(CHANGE_EVENT))
  }, [])

  return { favs, toggle }
}
