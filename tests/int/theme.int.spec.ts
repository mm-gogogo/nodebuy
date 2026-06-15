import { describe, it, expect } from 'vitest'
import { parseTheme, THEME_KEY, THEME_INIT_SCRIPT } from '@/lib/theme'

describe('parseTheme', () => {
  it('接受 light / dark', () => {
    expect(parseTheme('light')).toBe('light')
    expect(parseTheme('dark')).toBe('dark')
  })
  it('其它值返回 null', () => {
    expect(parseTheme('')).toBeNull()
    expect(parseTheme('blue')).toBeNull()
    expect(parseTheme(null)).toBeNull()
    expect(parseTheme(undefined)).toBeNull()
  })
})

describe('THEME_INIT_SCRIPT', () => {
  it('引用正确的存储键并在 try/catch 中设置 data-theme', () => {
    expect(THEME_INIT_SCRIPT).toContain(THEME_KEY)
    expect(THEME_INIT_SCRIPT).toContain('dataset.theme') // 设置 <html data-theme>
    expect(THEME_INIT_SCRIPT).toContain('prefers-color-scheme')
    expect(THEME_INIT_SCRIPT).toContain('try')
  })
})
