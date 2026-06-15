'use client'

import React from 'react'

import { useTheme } from '@/components/useTheme'

export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const dark = theme === 'dark'
  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={dark ? '切换到浅色主题' : '切换到深色主题'}
      aria-pressed={dark}
      onClick={toggle}
    >
      <span aria-hidden="true">{dark ? '☀' : '☾'}</span>
    </button>
  )
}
