'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'

import { sortValue, type ValueRow, type ValueSort } from '@/lib/value'
import { toggleCapped } from '@/lib/selection'
import { MAX_COMPARE } from '@/lib/compare'
import { routeLabels } from '@/lib/labels'

const SORTS: { value: ValueSort; label: string }[] = [
  { value: 'ram', label: '每 G 内存最便宜' },
  { value: 'storage', label: '每 G 硬盘最便宜' },
  { value: 'traffic', label: '每 TB 流量最便宜' },
]

// 等效月价:小于 10 美元保留两位,便于看清甜点机价差。
const money = (n: number) => (Number.isFinite(n) ? `$${n < 10 ? n.toFixed(2) : n.toFixed(0)}` : '—')

// 单位价:小于 1 美元保留两位,否则一位。null → 「—」。
const unit = (n: number | null) => (n == null ? '—' : `$${n < 1 ? n.toFixed(2) : n.toFixed(1)}`)

export function ValueTable({ rows }: { rows: ValueRow[] }) {
  const [sort, setSort] = useState<ValueSort>('ram')
  const [selected, setSelected] = useState<number[]>([])
  const sorted = useMemo(() => sortValue(rows, sort), [rows, sort])

  const atMax = selected.length >= MAX_COMPARE

  return (
    <>
      <div className="filter-bar">
        <label className="filter-sort">
          <span className="vh">排序</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as ValueSort)} aria-label="按性价比维度排序">
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <span className="filter-count" role="status">
          {rows.length} 个在售套餐
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="bench-rank">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">套餐 / 服务商</th>
              <th scope="col" className={sort === 'ram' ? 'is-sorted' : undefined}>$/G 内存</th>
              <th scope="col" className={sort === 'storage' ? 'is-sorted' : undefined}>$/G 硬盘</th>
              <th scope="col" className={sort === 'traffic' ? 'is-sorted' : undefined}>$/TB 流量</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r, i) => {
              const on = selected.includes(r.id)
              return (
                <tr key={r.id}>
                  <td className="rank-no">{String(i + 1).padStart(2, '0')}</td>
                  <td>
                    <Link href={`/providers/${r.providerSlug}`} className="bench-title">
                      {r.name}
                    </Link>
                    <span className="bench-provider">
                      {r.providerName}
                      {r.location ? ` · ${r.location}` : ''}
                      {r.route ? ` · ${routeLabels[r.route] || r.route}` : ''}
                      {' · '}
                      {money(r.monthly)}/月
                    </span>
                    <button
                      type="button"
                      className={`cmp-toggle${on ? ' is-on' : ''}`}
                      aria-pressed={on}
                      disabled={!on && atMax}
                      onClick={() => setSelected((cur) => toggleCapped(cur, r.id, MAX_COMPARE))}
                      title={!on && atMax ? `最多对比 ${MAX_COMPARE} 个` : '加入对比'}
                    >
                      {on ? '✓ 已选' : '对比'}
                    </button>
                  </td>
                  <td className={sort === 'ram' ? 'is-sorted' : undefined}>{unit(r.perGbRam)}</td>
                  <td className={sort === 'storage' ? 'is-sorted' : undefined}>{unit(r.perGbStorage)}</td>
                  <td className={sort === 'traffic' ? 'is-sorted' : undefined}>
                    {r.unlimitedTraffic ? '不限' : unit(r.perTbTraffic)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

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
