import { describe, it, expect } from 'vitest'
import {
  parseFavorites,
  serializeFavorites,
  hasFavorite,
  toggleFavorite,
  FAVORITES_KEY,
  PLAN_FAVORITES_KEY,
} from '@/lib/favorites'

describe('parseFavorites', () => {
  it('解析合法 JSON 数组', () => {
    expect(parseFavorites('["a","b"]')).toEqual(['a', 'b'])
  })
  it('去重并过滤非字符串/空串', () => {
    expect(parseFavorites('["a","a","",1,null,"b"]')).toEqual(['a', 'b'])
  })
  it('空/非法 JSON 返回空数组', () => {
    expect(parseFavorites(null)).toEqual([])
    expect(parseFavorites('')).toEqual([])
    expect(parseFavorites('not json')).toEqual([])
    expect(parseFavorites('{"a":1}')).toEqual([])
  })
})

describe('serializeFavorites', () => {
  it('序列化并去重', () => {
    expect(serializeFavorites(['a', 'b', 'a'])).toBe('["a","b"]')
  })
  it('与 parse 往返一致', () => {
    expect(parseFavorites(serializeFavorites(['x', 'y']))).toEqual(['x', 'y'])
  })
})

describe('hasFavorite', () => {
  it('判断是否已收藏', () => {
    expect(hasFavorite(['a', 'b'], 'a')).toBe(true)
    expect(hasFavorite(['a', 'b'], 'c')).toBe(false)
  })
})

describe('toggleFavorite', () => {
  it('未收藏则加入(追加到末尾)', () => {
    expect(toggleFavorite(['a'], 'b')).toEqual(['a', 'b'])
  })
  it('已收藏则移除', () => {
    expect(toggleFavorite(['a', 'b'], 'a')).toEqual(['b'])
  })
  it('不修改原数组', () => {
    const orig = ['a']
    toggleFavorite(orig, 'b')
    expect(orig).toEqual(['a'])
  })
  it('对套餐 id 字符串同样适用(服务商存 slug、套餐存 String(id))', () => {
    expect(toggleFavorite(['12'], '42')).toEqual(['12', '42'])
    expect(toggleFavorite(['12', '42'], '12')).toEqual(['42'])
    expect(parseFavorites(serializeFavorites(['7', '7', '9']))).toEqual(['7', '9'])
  })
})

describe('收藏库 key 互相独立', () => {
  it('服务商与套餐用不同 localStorage key', () => {
    expect(FAVORITES_KEY).not.toBe(PLAN_FAVORITES_KEY)
    expect(FAVORITES_KEY).toBe('nodebuy:favorites')
    expect(PLAN_FAVORITES_KEY).toBe('nodebuy:fav-plans')
  })
})
