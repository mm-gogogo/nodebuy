import React from 'react'
import Link from 'next/link'

import { isHexColor } from '@/lib/color'
import type { Crumb } from '@/lib/jsonld'

// 可见面包屑导航,与详情页的 BreadcrumbList JSON-LD 对应。
// 最后一项为当前页,不可点击并标记 aria-current。
export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav className="breadcrumbs" aria-label="面包屑">
      <ol>
        {crumbs.map((c, i) => {
          const isLast = i === crumbs.length - 1
          return (
            <li key={c.path}>
              {isLast ? (
                <span aria-current="page">{c.name}</span>
              ) : (
                <Link href={c.path}>{c.name}</Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export function ProviderMark({
  name,
  brandColor,
  large,
}: {
  name: string
  brandColor?: string | null
  large?: boolean
}) {
  const letter = name.replace(/^搬瓦工\s*/, 'B').charAt(0).toUpperCase()
  // 仅在确为合法 hex 时采用，否则回落到默认底色，避免非法值被浏览器丢弃后白字白底不可见
  const background = brandColor && isHexColor(brandColor) ? brandColor : 'var(--color-ink)'
  return (
    <span
      className={`p-mark${large ? ' p-mark--lg' : ''}`}
      style={{ background }}
      aria-hidden="true"
    >
      {letter}
    </span>
  )
}

export function ScoreChip({ score }: { score?: number | null }) {
  if (score == null) return null
  return (
    <span className="score-chip">
      {score.toFixed(1)}
      <small> / 10</small>
    </span>
  )
}

export function ScoreBars({
  scores,
}: {
  scores?: {
    performance?: number | null
    network?: number | null
    value?: number | null
    support?: number | null
  } | null
}) {
  if (!scores) return null
  const rows: Array<[string, number | null | undefined]> = [
    ['性能', scores.performance],
    ['网络', scores.network],
    ['性价比', scores.value],
    ['售后', scores.support],
  ]
  return (
    <div className="score-bars">
      {rows.map(([label, v]) =>
        v == null ? null : (
          <div className="score-bar" key={label}>
            <span>{label}</span>
            <span className="track">
              <span className="fill" style={{ width: `${v * 10}%` }} />
            </span>
            <span className="val">{v.toFixed(1)}</span>
          </div>
        ),
      )}
    </div>
  )
}

export function AffButton({
  slug,
  planId,
  dealId,
  label = '官网直达',
}: {
  slug: string
  planId?: string | number
  dealId?: string | number
  label?: string
}) {
  const query = planId ? `?plan=${planId}` : dealId ? `?deal=${dealId}` : ''
  const href = `/go/${slug}${query}`
  return (
    <a className="btn-ink" href={href} target="_blank" rel="nofollow noopener sponsored">
      {label}
    </a>
  )
}

export function RailHead({ title, moreHref, moreLabel }: { title: string; moreHref?: string; moreLabel?: string }) {
  return (
    <div className="rail__head">
      <h2>{title}</h2>
      {moreHref ? (
        <Link className="more" href={moreHref}>
          {moreLabel || '查看全部 →'}
        </Link>
      ) : null}
    </div>
  )
}
