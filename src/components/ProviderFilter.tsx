'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'

import { ProviderMark, ScoreChip } from '@/components/ui'
import { filterSortProviders, type ProviderItem, type ProviderSort } from '@/lib/providerFilter'
import { payLabels, regionLabels } from '@/lib/labels'

const SORTS: { value: ProviderSort; label: string }[] = [
  { value: 'score', label: '综合评分 高→低' },
  { value: 'price', label: '起步价 低→高' },
  { value: 'plans', label: '在售套餐 多→少' },
  { value: 'name', label: '名称' },
]

export function ProviderFilter({ items }: { items: ProviderItem[] }) {
  const [query, setQuery] = useState('')
  const [cnOnly, setCnOnly] = useState(false)
  const [inStockOnly, setInStockOnly] = useState(false)
  const [region, setRegion] = useState('all')
  const [payment, setPayment] = useState('all')
  const [sort, setSort] = useState<ProviderSort>('score')

  // 只展示数据里出现过的区域
  const regions = useMemo(() => {
    const set = new Set<string>()
    for (const it of items) for (const r of it.regions) set.add(r)
    return [...set]
  }, [items])

  // 只展示数据里出现过的付款方式
  const payments = useMemo(() => {
    const set = new Set<string>()
    for (const it of items) for (const m of it.paymentMethods) set.add(m)
    return [...set]
  }, [items])

  const filtered = useMemo(
    () => filterSortProviders(items, { query, cnOnly, inStockOnly, region, payment, sort }),
    [items, query, cnOnly, inStockOnly, region, payment, sort],
  )

  return (
    <>
      <div className="filter-bar">
        <input
          type="search"
          className="filter-search"
          placeholder="搜索服务商名称 / 总部…"
          aria-label="搜索服务商"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {payments.length ? (
          <label className="filter-sort">
            <span className="vh">付款方式</span>
            <select value={payment} onChange={(e) => setPayment(e.target.value)} aria-label="按付款方式筛选">
              <option value="all">不限付款</option>
              {payments.map((m) => (
                <option key={m} value={m}>
                  {payLabels[m] || m}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <label className="filter-sort">
          <span className="vh">排序</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as ProviderSort)} aria-label="排序方式">
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className={`filter-chip${cnOnly ? ' is-on' : ''}`}
          aria-pressed={cnOnly}
          onClick={() => setCnOnly((v) => !v)}
        >
          大陆优化
        </button>
        <button
          type="button"
          className={`filter-chip${inStockOnly ? ' is-on' : ''}`}
          aria-pressed={inStockOnly}
          onClick={() => setInStockOnly((v) => !v)}
        >
          有在售套餐
        </button>
        <span className="filter-count" role="status">
          {filtered.length} / {items.length}
        </span>
      </div>

      {regions.length > 1 ? (
        <div className="route-tabs" role="group" aria-label="按机房地区筛选">
          <button
            type="button"
            className={`filter-chip${region === 'all' ? ' is-on' : ''}`}
            aria-pressed={region === 'all'}
            onClick={() => setRegion('all')}
          >
            全部地区
          </button>
          {regions.map((r) => (
            <button
              key={r}
              type="button"
              className={`filter-chip${region === r ? ' is-on' : ''}`}
              aria-pressed={region === r}
              onClick={() => setRegion(r)}
            >
              {regionLabels[r] || r}
            </button>
          ))}
        </div>
      ) : null}

      <ul className="provider-index">
        {filtered.map((p) => (
          <li key={p.id}>
            <Link href={`/providers/${p.slug}`}>
              <ProviderMark name={p.name} brandColor={p.brandColor} />
              <span className="grow">
                <span className="name">
                  {p.name}
                  {p.cnOptimized ? <span className="badge badge--accent">大陆优化</span> : null}
                </span>
                <span className="sub">{p.tagline || p.headquarters || ''}</span>
              </span>
              <span className="facts">
                {p.startingMonthly != null ? (
                  <span>起步 ${Math.round(p.startingMonthly * 100) / 100}/月</span>
                ) : null}
                {p.datacenterCount ? <span>{p.datacenterCount} 个机房</span> : null}
                {p.planCount ? <span>{p.planCount} 个在售套餐</span> : null}
              </span>
              <ScoreChip score={p.overallScore} />
            </Link>
          </li>
        ))}
      </ul>
      {filtered.length === 0 ? <p className="empty-note">没有符合条件的服务商，换个关键词试试。</p> : null}
    </>
  )
}
