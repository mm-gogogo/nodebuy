import React from 'react'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'

import { ProviderMark, ScoreChip } from '@/components/ui'
import { searchAll } from '@/lib/search'
import { fmtDate, specLine } from '@/lib/labels'

export const metadata = { title: '搜索' }

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = '' } = await searchParams
  const term = q.trim()
  const payload = await getPayload({ config })
  const results = term ? await searchAll(payload, term) : null

  return (
    <div className="wrap">
      <header className="masthead">
        <h1>搜索</h1>
        <form action="/search" role="search" className="search-page-form">
          <input
            type="search"
            name="q"
            defaultValue={term}
            placeholder="搜索服务商 / 测评 / 套餐 / 榜单…"
            aria-label="站内搜索"
            className="filter-search"
            autoFocus
          />
          <button type="submit" className="btn-ink">
            搜索
          </button>
        </form>
        {results ? (
          <p className="lede" role="status">
            “{term}” 找到 {results.total} 条结果
          </p>
        ) : (
          <p className="lede">输入关键词,跨服务商、测评、套餐与榜单一起搜。</p>
        )}
      </header>

      {results && results.total === 0 ? <p className="empty-note">没有匹配 “{term}” 的内容。</p> : null}

      {results && results.providers.length ? (
        <section className="rail--tight">
          <h2 className="search-group-title">服务商</h2>
          <ul className="provider-index">
            {results.providers.map((p) => (
              <li key={p.id}>
                <Link href={`/providers/${p.slug}`}>
                  <ProviderMark name={p.name} brandColor={p.brandColor} />
                  <span className="grow">
                    <span className="name">{p.name}</span>
                    <span className="sub">{p.tagline || ''}</span>
                  </span>
                  <ScoreChip score={p.overallScore} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {results && results.reviews.length ? (
        <section className="rail--tight">
          <h2 className="search-group-title">测评</h2>
          <div role="list">
            {results.reviews.map((r) => (
              <Link role="listitem" className="review-row" key={r.id} href={`/reviews/${r.slug}`}>
                <span className="t">{r.title}</span>
                <span className="meta">{fmtDate(r.publishedAt)}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {results && results.plans.length ? (
        <section className="rail--tight">
          <h2 className="search-group-title">套餐</h2>
          <ul className="plan-browse">
            {results.plans.map((p) => {
              const provider = p.provider && typeof p.provider === 'object' ? (p.provider as { name?: string; slug?: string; brandColor?: string | null }) : null
              return (
                <li key={p.id}>
                  {provider ? <ProviderMark name={provider.name || '—'} brandColor={provider.brandColor} /> : null}
                  <span className="pb-main">
                    <span className="pb-name">{p.name}</span>
                    {provider ? <span className="pb-sub">{provider.name}</span> : null}
                  </span>
                  <span className="pb-spec">{specLine(p as Parameters<typeof specLine>[0])}</span>
                  {provider?.slug ? <Link className="btn-ghost" href={`/providers/${provider.slug}`}>查看</Link> : null}
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}

      {results && results.rankings.length ? (
        <section className="rail--tight">
          <h2 className="search-group-title">榜单</h2>
          <ul className="cat-list">
            {results.rankings.map((r) => (
              <li key={r.id}>
                <Link href={`/rankings/${r.slug}`}>
                  <span className="t">{r.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
