'use client'

import React, { useRef, useState } from 'react'

type State = 'idle' | 'copied' | 'error'

// 在非安全上下文（HTTP / IP 访问）下 navigator.clipboard 不可用，
// 回落到隐藏 textarea + execCommand，保证自建/HTTP 部署也能复制优惠码。
function writeClipboard(text: string): boolean {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).catch(() => fallbackCopy(text))
    return true
  }
  return fallbackCopy(text)
}

function fallbackCopy(text: string): boolean {
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  } catch {
    return false
  }
}

export function CopyCode({ code }: { code: string }) {
  const [state, setState] = useState<State>('idle')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function copy() {
    if (timer.current) clearTimeout(timer.current)
    setState(writeClipboard(code) ? 'copied' : 'error')
    timer.current = setTimeout(() => setState('idle'), 1800)
  }

  return (
    <button
      type="button"
      className={`code-chip${state === 'copied' ? ' is-copied' : ''}${state === 'error' ? ' is-error' : ''}`}
      onClick={copy}
      aria-label={`复制优惠码 ${code}`}
    >
      {state === 'copied' ? '已复制' : state === 'error' ? '复制失败' : code}
    </button>
  )
}
