'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'

import { sortNetwork, type NetRow, type NetSort } from '@/lib/network'

const SORTS: { value: NetSort; label: string }[] = [
  { value: 'download', label: '最佳下载 高→低' },
  { value: 'latency', label: '最低延迟 低→高' },
]

const num = (n: number | null, unit: string) => (n != null ? `${n.toLocaleString('en-US')} ${unit}` : '—')

export function NetworkTable({ rows }: { rows: NetRow[] }) {
  const [sort, setSort] = useState<NetSort>('download')
  const sorted = useMemo(() => sortNetwork(rows, sort), [rows, sort])

  return (
    <>
      <div className="filter-bar">
        <label className="filter-sort">
          <span className="vh">排序</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as NetSort)} aria-label="按指标排序">
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
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
              <th scope="col" className={sort === 'download' ? 'is-sorted' : undefined}>最佳下载</th>
              <th scope="col">最佳上传</th>
              <th scope="col" className={sort === 'latency' ? 'is-sorted' : undefined}>最低延迟</th>
              <th scope="col">测速节点</th>
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
                <td className={sort === 'download' ? 'is-sorted' : undefined}>{num(r.maxDownload, 'Mbps')}</td>
                <td>{num(r.maxUpload, 'Mbps')}</td>
                <td className={sort === 'latency' ? 'is-sorted' : undefined}>{num(r.minLatency, 'ms')}</td>
                <td>{r.nodeCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
