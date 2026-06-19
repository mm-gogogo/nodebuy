import React from 'react'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'

import { AffButton, ProviderMark } from '@/components/ui'
import { parseProviderSlugs, compareProviderRows, type CompareProvider } from '@/lib/compareProviders'
import { datacenterRegionLabels } from '@/lib/providerCoverage'

export const metadata = { title: '服务商对比' }

export default async function CompareProvidersPage({
  searchParams,
}: {
  searchParams: Promise<{ slugs?: string }>
}) {
  const { slugs: param } = await searchParams
  const slugs = parseProviderSlugs(param)

  const payload = await getPayload({ config })
  let providers: CompareProvider[] = []
  if (slugs.length) {
    const res = await payload.find({ collection: 'providers', where: { slug: { in: slugs } }, limit: slugs.length })
    const bySlug = new Map(res.docs.map((p) => [p.slug, p]))
    providers = slugs
      .map((s) => bySlug.get(s))
      .filter((p): p is NonNullable<typeof p> => Boolean(p))
      .map((p) => ({
        name: p.name,
        slug: p.slug,
        brandColor: p.brandColor,
        overallScore: p.overallScore,
        scores: p.scores,
        founded: p.founded,
        headquarters: p.headquarters,
        paymentMethods: p.paymentMethods,
        datacenterCount: p.datacenters?.length || 0,
        regions: datacenterRegionLabels(p.datacenters),
        cnOptimized: (p.datacenters || []).some((dc) => dc.cnOptimized),
      }))
  }

  const rows = compareProviderRows(providers)

  return (
    <div className="wrap">
      <header className="masthead">
        <h1>服务商对比</h1>
        <p className="lede">
          {providers.length ? `并排比较 ${providers.length} 家服务商的评分与机房。` : '在我的收藏里选服务商即可加入对比。'}
        </p>
      </header>

      {providers.length === 0 ? (
        <p className="empty-note">
          还没有要对比的服务商。去 <Link href="/favorites">我的收藏</Link> 选几家,或在服务商页点「♡ 收藏」。
        </p>
      ) : (
        <section className="rail--tight" style={{ overflowX: 'auto' }}>
          <table className="compare-table">
            <thead>
              <tr>
                <th scope="col">对比项</th>
                {providers.map((p) => (
                  <th scope="col" key={p.slug}>
                    <Link href={`/providers/${p.slug}`} className="cmp-head">
                      <ProviderMark name={p.name} brandColor={p.brandColor} />
                      <span className="cmp-name">{p.name}</span>
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  {row.values.map((v, i) => {
                    const best = row.best?.includes(i)
                    return (
                      <td key={providers[i].slug} className={best ? 'is-best' : undefined}>
                        {v}
                        {best ? (
                          <span className="cmp-best" aria-label="本项最优" title="本项最优">
                            {' '}
                            ✓
                          </span>
                        ) : null}
                      </td>
                    )
                  })}
                </tr>
              ))}
              <tr>
                <th scope="row">官网</th>
                {providers.map((p) => (
                  <td key={p.slug}>
                    <AffButton slug={p.slug} label="直达" />
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
