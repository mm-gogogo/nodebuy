import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'

import { AffButton } from '@/components/ui'
import { CopyCode } from '@/components/CopyCode'
import { fmtDate } from '@/lib/labels'

export const revalidate = 60

export const metadata = { title: '优惠速递' }

export default async function DealsPage() {
  const payload = await getPayload({ config })
  const deals = await payload.find({ collection: 'deals', limit: 100, sort: '-featured' })

  return (
    <div className="wrap">
      <header className="masthead">
        <h1>优惠速递</h1>
        <p className="lede">优惠码点击即复制。过期与失效的码会被下架，列表里的都是当前可用的。</p>
      </header>
      <section className="rail--tight">
        <div role="list">
          {deals.docs.map((d) => {
            const provider = typeof d.provider === 'object' ? d.provider : null
            return (
              <div role="listitem" className="deal-row" key={d.id}>
                <div className="grow">
                  <span className="t">{d.title}</span>
                  {d.description ? <span className="d" style={{ display: 'block' }}>{d.description}</span> : null}
                </div>
                {d.discount ? <span className="badge badge--accent">{d.discount}</span> : null}
                {d.code ? <CopyCode code={d.code} /> : null}
                {d.expiresAt ? <span className="exp">截至 {fmtDate(d.expiresAt)}</span> : null}
                {provider ? <AffButton slug={provider.slug} label="去下单" /> : null}
              </div>
            )
          })}
          {deals.docs.length === 0 ? <p className="empty-note">暂无在售优惠。</p> : null}
        </div>
      </section>
    </div>
  )
}
