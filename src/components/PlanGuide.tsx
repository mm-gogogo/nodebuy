'use client'

import React, { useMemo, useState } from 'react'

import { AffButton, ProviderMark } from '@/components/ui'
import { priceLine, routeLabels, specLine } from '@/lib/labels'
import { pricePerCore, pricePerGbRam, pricePerGbStorage, type PlanItem } from '@/lib/planBrowse'
import { pricePerTbTraffic } from '@/lib/value'
import { recommendPlans, USE_CASES, type UseCase } from '@/lib/planGuide'

const USE_CASE_LABELS: Record<UseCase, string> = {
  balanced: '通用 / 建站',
  traffic: '中转 / 流量',
  storage: '存储 / 备份',
  compute: '算力 / CPU',
}
const USE_CASE_OPTIONS = USE_CASES.map((value) => ({ value, label: USE_CASE_LABELS[value] }))

const BUDGETS: { value: number | null; label: string }[] = [
  { value: null, label: '不限' },
  { value: 5, label: '≤ $5' },
  { value: 10, label: '≤ $10' },
  { value: 20, label: '≤ $20' },
]
const RAMS: { value: number; label: string }[] = [
  { value: 0, label: '不限' },
  { value: 1024, label: '1G+' },
  { value: 2048, label: '2G+' },
  { value: 4096, label: '4G+' },
]

// 单价格式:大硬盘套餐每 G 不足一分,保留三位避免显示成 $0.00(看着像免费)。
const fmtUnit = (v: number): string => (v < 0.01 ? v.toFixed(3) : v < 1 ? v.toFixed(2) : v.toFixed(1))

// 按用途显示对应「单位等效月价」,与排序口径一致。
function unitFor(p: PlanItem, useCase: UseCase): string | null {
  if (useCase === 'traffic') {
    if (p.trafficTB === 0) return '不限流量'
    const t = pricePerTbTraffic(p)
    return t == null ? null : `≈$${fmtUnit(t)}/TB流量`
  }
  const fn = useCase === 'storage' ? pricePerGbStorage : useCase === 'compute' ? pricePerCore : pricePerGbRam
  const v = fn(p)
  if (!Number.isFinite(v)) return null
  const label = useCase === 'storage' ? 'G硬盘' : useCase === 'compute' ? '核' : 'G内存'
  return `≈$${fmtUnit(v)}/${label}`
}

function Chips<T>({
  label,
  options,
  value,
  onChange,
  eq,
}: {
  label: string
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
  eq: (a: T, b: T) => boolean
}) {
  return (
    <div className="guide-q">
      <span className="guide-q-label">{label}</span>
      <div className="route-tabs" role="group" aria-label={label}>
        {options.map((o) => (
          <button
            key={o.label}
            type="button"
            className={`filter-chip${eq(o.value, value) ? ' is-on' : ''}`}
            aria-pressed={eq(o.value, value)}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function PlanGuide({ items }: { items: PlanItem[] }) {
  const [useCase, setUseCase] = useState<UseCase>('balanced')
  const [maxMonthly, setMaxMonthly] = useState<number | null>(10)
  const [minRamMB, setMinRamMB] = useState(0)
  const [cnOptimized, setCnOptimized] = useState(false)

  const picks = useMemo(
    () => recommendPlans(items, { maxMonthly, minRamMB, cnOptimized, useCase }),
    [items, maxMonthly, minRamMB, cnOptimized, useCase],
  )

  return (
    <>
      <div className="guide-form">
        <Chips label="用途" options={USE_CASE_OPTIONS} value={useCase} onChange={setUseCase} eq={(a, b) => a === b} />
        <Chips label="月预算" options={BUDGETS} value={maxMonthly} onChange={setMaxMonthly} eq={(a, b) => a === b} />
        <Chips label="内存需求" options={RAMS} value={minRamMB} onChange={setMinRamMB} eq={(a, b) => a === b} />
        <div className="guide-q">
          <span className="guide-q-label">大陆访问</span>
          <button
            type="button"
            className={`filter-chip${cnOptimized ? ' is-on' : ''}`}
            aria-pressed={cnOptimized}
            onClick={() => setCnOptimized((v) => !v)}
          >
            需要大陆优化线路
          </button>
        </div>
      </div>

      <h2 className="search-group-title" role="status">
        {picks.length ? `按「${USE_CASE_LABELS[useCase]}」为你挑了 ${picks.length} 个最划算的` : '没有完全匹配的'}
      </h2>

      {picks.length === 0 ? (
        <p className="empty-note">放宽一点预算或内存要求再试试。</p>
      ) : (
        <ul className="plan-browse">
          {picks.map((p) => {
            const price = priceLine(p)
            const unit = unitFor(p, useCase)
            return (
              <li key={p.id}>
                <ProviderMark name={p.providerName} brandColor={p.brandColor} />
                <span className="pb-main">
                  <span className="pb-name">{p.name}</span>
                  <span className="pb-sub">
                    {p.providerName}
                    {p.location ? ` · ${p.location}` : ''}
                  </span>
                </span>
                <span className="pb-spec">{specLine(p)}</span>
                {p.route ? <span className="badge badge--accent">{routeLabels[p.route] || p.route}</span> : null}
                <span className="pb-price">
                  <strong>{price.amount}</strong>
                  {price.cycle}
                  {unit ? <span className="pb-unit">{unit}</span> : null}
                </span>
                <AffButton slug={p.providerSlug} planId={p.id} label="入手" />
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
