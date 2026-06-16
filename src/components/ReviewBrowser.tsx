'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

import { filterReviews, overallScore, reviewProviderOptions, type ReviewItem, type ReviewSort } from '@/lib/reviewFilter'
import { buildReviewQuery, DEFAULT_REVIEW_STATE, type ReviewQueryState } from '@/lib/reviewQuery'
import { fmtDate } from '@/lib/labels'

const SORTS: { value: ReviewSort; label: string }[] = [
  { value: 'newest', label: '最新发布' },
  { value: 'overall', label: '综合评分' },
  { value: 'performance', label: '性能评分' },
  { value: 'network', label: '网络评分' },
  { value: 'value', label: '性价比评分' },
]

export function ReviewBrowser({ items, initial }: { items: ReviewItem[]; initial?: ReviewQueryState }) {
  const init = initial ?? DEFAULT_REVIEW_STATE
  const [query, setQuery] = useState(init.query)
  const [provider, setProvider] = useState(init.provider)
  const [sort, setSort] = useState<ReviewSort>(init.sort)

  // 同步筛选状态到 URL(history.replaceState,纯客户端、不触发重新请求)
  useEffect(() => {
    const qs = buildReviewQuery({ query, provider, sort })
    const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname
    window.history.replaceState(null, '', url)
  }, [query, provider, sort])

  const providers = useMemo(() => reviewProviderOptions(items), [items])
  const shown = useMemo(() => filterReviews(items, { query, provider, sort }), [items, query, provider, sort])

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
          <span className="vh">排序方式</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as ReviewSort)} aria-label="排序方式">
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
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
        {shown.map((r) => {
          const overall = overallScore(r.scores)
          return (
            <Link role="listitem" className="review-row" key={r.id} href={`/reviews/${r.slug}`}>
              <span className="t">
                {r.title}
                <span className="badge" style={{ marginLeft: 'var(--space-xs)' }}>
                  {r.providerName}
                </span>
              </span>
              {overall != null ? (
                <span className="rev-score">
                  <span className="k">综合</span>
                  {overall.toFixed(1)}
                </span>
              ) : null}
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
          )
        })}
      </div>
      {shown.length === 0 ? <p className="empty-note">没有符合条件的测评,换个关键词试试。</p> : null}
    </>
  )
}
