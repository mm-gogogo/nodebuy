'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'

import { AffButton, ProviderMark } from '@/components/ui'
import { priceLine, routeLabels, specLine } from '@/lib/labels'
import { filterSortPlans, type PlanItem, type PlanSort } from '@/lib/planBrowse'
import { MAX_COMPARE } from '@/lib/compare'

const SORTS: { value: PlanSort; label: string }[] = [
  { value: 'price-asc', label: '价格 低→高' },
  { value: 'price-desc', label: '价格 高→低' },
  { value: 'ram-desc', label: '内存 大→小' },
]

const RAM_STEPS: { mb: number; label: string }[] = [
  { mb: 0, label: '内存不限' },
  { mb: 1024, label: '1G+' },
  { mb: 2048, label: '2G+' },
  { mb: 4096, label: '4G+' },
  { mb: 8192, label: '8G+' },
]

export function PlanBrowser({ items, initialRoute }: { items: PlanItem[]; initialRoute?: string }) {
  const [query, setQuery] = useState('')
  // 仅当 initialRoute 是数据里实际存在的线路时采用,否则回落到「全部」
  const [route, setRoute] = useState(
    initialRoute && items.some((p) => p.route === initialRoute) ? initialRoute : 'all',
  )
  const [sort, setSort] = useState<PlanSort>('price-asc')
  const [inStockOnly, setInStockOnly] = useState(false)
  const [maxPrice, setMaxPrice] = useState('')
  const [minRamMB, setMinRamMB] = useState(0)
  const [selected, setSelected] = useState<number[]>([])

  const atMax = selected.length >= MAX_COMPARE
  function toggleCompare(id: number) {
    setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : cur.length >= MAX_COMPARE ? cur : [...cur, id]))
  }

  // 只展示数据里实际出现过的线路
  const routes = useMemo(() => {
    const set = new Set<string>()
    for (const p of items) if (p.route) set.add(p.route)
    return [...set]
  }, [items])

  const maxMonthly = maxPrice.trim() === '' ? null : Number(maxPrice)
  const shown = useMemo(
    () =>
      filterSortPlans(items, {
        query,
        route,
        sort,
        inStockOnly,
        maxMonthly: maxMonthly != null && Number.isFinite(maxMonthly) ? maxMonthly : null,
        minRamMB,
      }),
    [items, query, route, sort, inStockOnly, maxMonthly, minRamMB],
  )

  return (
    <>
      <div className="filter-bar">
        <input
          type="search"
          className="filter-search"
          placeholder="搜索套餐 / 服务商 / 机房…"
          aria-label="搜索套餐"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <label className="filter-sort">
          <span className="vh">排序</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as PlanSort)} aria-label="排序方式">
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className={`filter-chip${inStockOnly ? ' is-on' : ''}`}
          aria-pressed={inStockOnly}
          onClick={() => setInStockOnly((v) => !v)}
        >
          仅有货
        </button>
        <span className="filter-count" role="status">
          {shown.length} / {items.length}
        </span>
      </div>

      <div className="route-tabs" role="group" aria-label="按线路筛选">
        <button
          type="button"
          className={`filter-chip${route === 'all' ? ' is-on' : ''}`}
          aria-pressed={route === 'all'}
          onClick={() => setRoute('all')}
        >
          全部线路
        </button>
        {routes.map((r) => (
          <button
            key={r}
            type="button"
            className={`filter-chip${route === r ? ' is-on' : ''}`}
            aria-pressed={route === r}
            onClick={() => setRoute(r)}
          >
            {routeLabels[r] || r}
          </button>
        ))}
      </div>

      <div className="refine-bar">
        <label className="refine-price">
          月价上限
          <input
            type="number"
            min="0"
            inputMode="decimal"
            placeholder="不限"
            aria-label="月价上限(美元)"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
          <span className="refine-unit">美元/月</span>
        </label>
        <div className="ram-tabs" role="group" aria-label="按内存下限筛选">
          {RAM_STEPS.map((r) => (
            <button
              key={r.mb}
              type="button"
              className={`filter-chip${minRamMB === r.mb ? ' is-on' : ''}`}
              aria-pressed={minRamMB === r.mb}
              onClick={() => setMinRamMB(r.mb)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <ul className="plan-browse">
        {shown.map((p) => {
          const price = priceLine(p)
          return (
            <li key={p.id}>
              <ProviderMark name={p.providerName} brandColor={p.brandColor} />
              <span className="pb-main">
                <span className="pb-name">{p.name}</span>
                <span className="pb-sub">
                  {p.providerName}
                  {p.location ? ` · ${p.location}` : ''}
                </span>
              </span>
              <span className="pb-spec">{specLine(p)}</span>
              {p.route ? <span className="badge badge--accent">{routeLabels[p.route] || p.route}</span> : null}
              <span className="pb-price">
                <strong>{price.amount}</strong>
                {price.cycle}
              </span>
              {(() => {
                const on = selected.includes(p.id)
                return (
                  <button
                    type="button"
                    className={`cmp-toggle${on ? ' is-on' : ''}`}
                    aria-pressed={on}
                    disabled={!on && atMax}
                    onClick={() => toggleCompare(p.id)}
                    title={!on && atMax ? `最多对比 ${MAX_COMPARE} 个` : '加入对比'}
                  >
                    {on ? '✓ 已选' : '对比'}
                  </button>
                )
              })()}
              {p.inStock ? (
                <AffButton slug={p.providerSlug} planId={p.id} label="入手" />
              ) : (
                <span className="oos">缺货</span>
              )}
            </li>
          )
        })}
      </ul>
      {shown.length === 0 ? <p className="empty-note">没有符合条件的套餐,换个筛选试试。</p> : null}

      {selected.length > 0 ? (
        <div className="compare-bar" role="region" aria-label="对比栏">
          <span className="cmp-count">
            已选 {selected.length}/{MAX_COMPARE} 个套餐
          </span>
          <button type="button" className="btn-ghost" onClick={() => setSelected([])}>
            清空
          </button>
          <Link className="btn-ink" href={`/compare?plans=${selected.join(',')}`}>
            对比这些套餐 →
          </Link>
        </div>
      ) : null}
    </>
  )
}
