import { describe, it, expect } from 'vitest'
import { breadcrumbList, absUrl } from '@/lib/jsonld'

describe('absUrl', () => {
  it('相对路径补全为绝对 URL', () => {
    expect(absUrl('/reviews/x')).toMatch(/^https?:\/\/.+\/reviews\/x$/)
  })
  it('已是绝对 URL 原样返回', () => {
    expect(absUrl('https://x.com/a')).toBe('https://x.com/a')
  })
})

describe('breadcrumbList', () => {
  const data = breadcrumbList([
    { name: '首页', path: '/' },
    { name: '测评', path: '/reviews' },
    { name: '某测评', path: '/reviews/foo' },
  ])

  it('结构与 schema.org BreadcrumbList 一致', () => {
    expect(data['@type']).toBe('BreadcrumbList')
    expect(data.itemListElement).toHaveLength(3)
  })

  it('position 从 1 递增,item 为绝对 URL', () => {
    expect(data.itemListElement.map((i) => i.position)).toEqual([1, 2, 3])
    expect(data.itemListElement[2].name).toBe('某测评')
    expect(data.itemListElement[2].item).toMatch(/\/reviews\/foo$/)
    expect(data.itemListElement[0].item).toMatch(/^https?:\/\//)
  })
})
