import React from 'react'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'

import { NetworkTable } from '@/components/NetworkTable'
import { networkRows, type NetReviewLike } from '@/lib/network'

export const revalidate = 60

export const metadata = {
  title: '三网测速排行',
  description: '把各篇实测的三网下载、上传与延迟汇成一张可排序排行,横向看哪台机器到大陆更快。',
}

export default async function NetworkPage() {
  const payload = await getPayload({ config })
  const reviews = await payload.find({
    collection: 'reviews',
    limit: 500,
    where: { _status: { equals: 'published' } },
    sort: '-publishedAt',
  })

  const items: NetReviewLike[] = reviews.docs.map((r) => {
    const provider = typeof r.provider === 'object' ? r.provider : null
    return {
      slug: r.slug,
      title: r.title,
      providerName: provider?.name || '—',
      benchmarks: r.benchmarks,
    }
  })

  const rows = networkRows(items)

  return (
    <div className="wrap">
      <header className="masthead">
        <h1>三网测速排行</h1>
        <p className="lede">
          把各篇实测的三网下载、上传与延迟放到一起排:按下载或延迟排序,横向看哪台机器到大陆更快。也看
          <Link href="/benchmarks"> 跑分排行 </Link>与<Link href="/value"> 性价比排行 </Link>。
        </p>
      </header>
      <section className="rail--tight">
        {rows.length === 0 ? <p className="empty-note">还没有带测速数据的测评。</p> : <NetworkTable rows={rows} />}
      </section>
    </div>
  )
}
