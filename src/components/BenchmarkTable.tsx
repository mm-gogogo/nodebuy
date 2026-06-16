'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'

import { sortBenchmarks, type BenchRow, type BenchSort } from '@/lib/benchmarks'

const SORTS: { value: BenchSort; label: string }[] = [
  { value: 'gb5Single', label: 'GB5 单核' },
  { value: 'gb5Multi', label: 'GB5 多核' },
  { value: 'diskRead', label: '磁盘读' },
  { value: 'diskWrite', label: '磁盘写' },
]

const num = (n: number | null) => (n != null ? n.toLocaleString('en-US') : '—')

export function BenchmarkTable({ rows }: { rows: BenchRow[] }) {
  const [sort, setSort] = useState<BenchSort>('gb5Single')
  const sorted = useMemo(() => sortBenchmarks(rows, sort), [rows, sort])

  return (
    <>
      <div className="filter-bar">
        <label className="filter-sort">
          <span className="vh">排序</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as BenchSort)} aria-label="按指标排序">
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label} 高→低
              </option>
            ))}
          </select>
        </label>
        <span className="filter-count" role="status">
          {rows.length} 条实测
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="bench-rank">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">测评 / 服务商</th>
              <th scope="col">CPU</th>
              <th scope="col">GB5 单核</th>
              <th scope="col">GB5 多核</th>
              <th scope="col">磁盘读</th>
              <th scope="col">磁盘写</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r, i) => (
              <tr key={r.slug}>
                <td className="rank-no">{String(i + 1).padStart(2, '0')}</td>
                <td>
                  <Link href={`/reviews/${r.slug}`} className="bench-title">
                    {r.title}
                  </Link>
                  <span className="bench-provider">{r.providerName}</span>
                </td>
                <td className="bench-cpu">{r.cpuModel || '—'}</td>
                <td className={sort === 'gb5Single' ? 'is-sorted' : undefined}>{num(r.gb5Single)}</td>
                <td className={sort === 'gb5Multi' ? 'is-sorted' : undefined}>{num(r.gb5Multi)}</td>
                <td className={sort === 'diskRead' ? 'is-sorted' : undefined}>{num(r.diskReadMBs)}</td>
                <td className={sort === 'diskWrite' ? 'is-sorted' : undefined}>{num(r.diskWriteMBs)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
