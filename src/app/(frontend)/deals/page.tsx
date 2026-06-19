import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'

import { AffButton } from '@/components/ui'
import { CopyCode } from '@/components/CopyCode'
import { fmtDate } from '@/lib/labels'
import { activeDealsWhere } from '@/lib/queries'
import { expiryUrgency, sortDealsByUrgency } from '@/lib/deals'

export const revalidate = 60

export const metadata = { title: '优惠速递' }

export default async function DealsPage() {
  const payload = await getPayload({ config })
  const deals = await payload.find({ collection: 'deals', limit: 100, sort: '-createdAt', where: activeDealsWhere() })
  // 置顶优先,其次让快到期的优惠浮到前面(与「⏳ 还剩 X 天」提示口径一致)。
  const ordered = sortDealsByUrgency(deals.docs)

  return (
    <div className="wrap">
      <header className="masthead">
        <h1>优惠速递</h1>
        <p className="lede">优惠码点击即复制。过期与失效的码会被下架，列表里的都是当前可用的。</p>
      </header>
      <section className="rail--tight">
        <div role="list">
          {ordered.map((d) => {
            const provider = typeof d.provider === 'object' ? d.provider : null
            const soon = expiryUrgency(d.expiresAt)
            return (
              <div role="listitem" className="deal-row" key={d.id}>
                <div className="grow">
                  <span className="t">{d.title}</span>
                  {d.description ? <span className="d" style={{ display: 'block' }}>{d.description}</span> : null}
                </div>
                {d.discount ? <span className="badge badge--accent">{d.discount}</span> : null}
                {d.code ? <CopyCode code={d.code} /> : null}
                {soon ? <span className="exp-soon">⏳ {soon}</span> : null}
                {d.expiresAt ? <span className="exp">截至 {fmtDate(d.expiresAt)}</span> : null}
                {provider ? <AffButton slug={provider.slug} dealId={d.id} label="去下单" /> : null}
              </div>
            )
          })}
          {deals.docs.length === 0 ? <p className="empty-note">暂无在售优惠。</p> : null}
        </div>
      </section>
    </div>
  )
}
