import React from 'react'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'

import { AffButton, ProviderMark } from '@/components/ui'
import { parsePlanIds, comparePlanRows, type ComparePlan } from '@/lib/compare'

export const metadata = { title: '套餐对比' }

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ plans?: string }> }) {
  const { plans: param } = await searchParams
  const ids = parsePlanIds(param)

  const payload = await getPayload({ config })
  let plans: ComparePlan[] = []
  if (ids.length) {
    const res = await payload.find({ collection: 'plans', where: { id: { in: ids } }, limit: ids.length })
    const byId = new Map(res.docs.map((p) => [p.id, p]))
    plans = ids
      .map((id) => byId.get(id))
      .filter((p): p is NonNullable<typeof p> => Boolean(p))
      .map((p) => {
        const provider = typeof p.provider === 'object' ? p.provider : null
        return {
          id: p.id as number,
          name: p.name,
          providerName: provider?.name || '—',
          providerSlug: provider?.slug || '',
          cpuCores: p.cpuCores,
          ramMB: p.ramMB,
          storageGB: p.storageGB,
          storageType: p.storageType,
          trafficTB: p.trafficTB,
          route: p.route,
          location: p.location,
          priceMonthly: p.priceMonthly,
          priceYearly: p.priceYearly,
          inStock: p.inStock !== false,
        }
      })
  }

  const rows = comparePlanRows(plans)

  return (
    <div className="wrap">
      <header className="masthead">
        <h1>套餐对比</h1>
        <p className="lede">
          {plans.length ? `并排比较 ${plans.length} 个套餐的规格与价格。` : '从套餐总览勾选套餐即可加入对比。'}
        </p>
      </header>

      {plans.length === 0 ? (
        <p className="empty-note">
          还没有要对比的套餐,先去 <Link href="/plans">套餐总览</Link> 勾选几个。
        </p>
      ) : (
        <section className="rail--tight" style={{ overflowX: 'auto' }}>
          <table className="compare-table">
            <thead>
              <tr>
                <th scope="col">对比项</th>
                {plans.map((p) => (
                  <th scope="col" key={p.id}>
                    <span className="cmp-head">
                      <ProviderMark name={p.providerName} />
                      <span className="cmp-name">{p.name}</span>
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  {row.values.map((v, i) => (
                    <td key={plans[i].id}>{v}</td>
                  ))}
                </tr>
              ))}
              <tr>
                <th scope="row">下单</th>
                {plans.map((p) => (
                  <td key={p.id}>
                    {p.inStock && p.providerSlug ? (
                      <AffButton slug={p.providerSlug} planId={p.id} label="入手" />
                    ) : (
                      <span className="oos">缺货</span>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </section>
      )}
    </div>
  )
}
