'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'

import { ProviderMark, ScoreChip } from '@/components/ui'
import { filterProviders, type ProviderItem } from '@/lib/providerFilter'

export function ProviderFilter({ items }: { items: ProviderItem[] }) {
  const [query, setQuery] = useState('')
  const [cnOnly, setCnOnly] = useState(false)
  const [inStockOnly, setInStockOnly] = useState(false)

  const filtered = useMemo(
    () => filterProviders(items, { query, cnOnly, inStockOnly }),
    [items, query, cnOnly, inStockOnly],
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
