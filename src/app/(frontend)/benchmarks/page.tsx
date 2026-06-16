import React from 'react'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'

import { BenchmarkTable } from '@/components/BenchmarkTable'
import { benchmarkRows, type BenchReviewLike } from '@/lib/benchmarks'

export const revalidate = 60

export const metadata = {
  title: '跑分排行',
  description: '把各篇实测的 Geekbench 5 与磁盘读写汇总成一张可排序的排行,横向比较哪台机器更快。',
}

export default async function BenchmarksPage() {
  const payload = await getPayload({ config })
  const reviews = await payload.find({
    collection: 'reviews',
    limit: 500,
    where: { _status: { equals: 'published' } },
    sort: '-publishedAt',
  })

  const items: BenchReviewLike[] = reviews.docs.map((r) => {
    const provider = typeof r.provider === 'object' ? r.provider : null
    return {
      slug: r.slug,
      title: r.title,
      providerName: provider?.name || '—',
      benchmarks: r.benchmarks,
    }
  })

  const rows = benchmarkRows(items)

  return (
    <div className="wrap">
      <header className="masthead">
        <h1>跑分排行</h1>
        <p className="lede">
          把各篇实测的 Geekbench 5 与磁盘读写放到一起排:按任一指标排序,横向看哪台机器更快。也看
          <Link href="/network"> 三网测速排行 </Link>与<Link href="/value"> 性价比排行 </Link>。
        </p>
      </header>
      <section className="rail--tight">
        {rows.length === 0 ? <p className="empty-note">还没有带跑分的测评。</p> : <BenchmarkTable rows={rows} />}
      </section>
    </div>
  )
}
