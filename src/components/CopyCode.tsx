'use client'

import React, { useRef, useState } from 'react'

type State = 'idle' | 'copied' | 'error'

export function CopyCode({ code }: { code: string }) {
  const [state, setState] = useState<State>('idle')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  async function copy() {
    if (timer.current) clearTimeout(timer.current)
    try {
      await navigator.clipboard.writeText(code)
      setState('copied')
    } catch {
      setState('error')
    }
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
