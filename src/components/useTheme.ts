'use client'

import { useCallback, useSyncExternalStore } from 'react'

import { THEME_KEY, type Theme } from '@/lib/theme'

// 用 useSyncExternalStore 订阅 <html data-theme>(外部状态),天然处理 SSR 与跨标签。
const THEME_CHANGE = 'nodebuy:themechange'

function getSnapshot(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}
function getServerSnapshot(): Theme {
  return 'light'
}
function subscribe(cb: () => void): () => void {
  window.addEventListener(THEME_CHANGE, cb)
  window.addEventListener('storage', cb)
  return () => {
    window.removeEventListener(THEME_CHANGE, cb)
    window.removeEventListener('storage', cb)
  }
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const toggle = useCallback(() => {
    const next: Theme = getSnapshot() === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    try {
      localStorage.setItem(THEME_KEY, next)
    } catch {
      // 隐私模式下忽略
    }
    window.dispatchEvent(new Event(THEME_CHANGE))
  }, [])

  return { theme, toggle }
}
