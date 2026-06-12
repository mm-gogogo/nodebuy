import React from 'react'
import Link from 'next/link'

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
  return (
    <span
      className={`p-mark${large ? ' p-mark--lg' : ''}`}
      style={{ background: brandColor || 'var(--color-ink)' }}
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
