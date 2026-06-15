'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'

import { filterReviews, reviewProviderOptions, type ReviewItem } from '@/lib/reviewFilter'
import { fmtDate } from '@/lib/labels'

export function ReviewBrowser({ items }: { items: ReviewItem[] }) {
  const [query, setQuery] = useState('')
  const [provider, setProvider] = useState('all')

  const providers = useMemo(() => reviewProviderOptions(items), [items])
  const shown = useMemo(() => filterReviews(items, { query, provider }), [items, query, provider])

  return (
    <>
      <div className="filter-bar">
        <input
          type="search"
          className="filter-search"
          placeholder="搜索测评标题 / 服务商…"
          aria-label="搜索测评"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <label className="filter-sort">
          <span className="vh">按服务商筛选</span>
          <select value={provider} onChange={(e) => setProvider(e.target.value)} aria-label="按服务商筛选">
            <option value="all">全部服务商</option>
            {providers.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <span className="filter-count" role="status">
          {shown.length} / {items.length}
        </span>
      </div>

      <div role="list">
        {shown.map((r) => (
          <Link role="listitem" className="review-row" key={r.id} href={`/reviews/${r.slug}`}>
            <span className="t">
              {r.title}
              <span className="badge" style={{ marginLeft: 'var(--space-xs)' }}>
                {r.providerName}
              </span>
            </span>
            {r.metrics.length ? (
              <span className="rev-metrics">
                {r.metrics.map((m) => (
                  <span className="rev-metric" key={m.label}>
                    <span className="k">{m.label}</span>
                    {m.value}
                  </span>
                ))}
              </span>
            ) : null}
            <span className="meta">{fmtDate(r.publishedAt)}</span>
          </Link>
        ))}
      </div>
      {shown.length === 0 ? <p className="empty-note">没有符合条件的测评,换个关键词试试。</p> : null}
    </>
  )
}
