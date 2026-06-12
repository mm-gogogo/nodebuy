import { getPayload } from 'payload'
import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'

// AFF 跳转：/go/<provider-slug>[?plan=<id>][?deal=<id>] → 302 到推广链接。
// 优先级：优惠级 url > 套餐级 affUrl > 服务商 affUrl > 服务商官网。
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const planId = req.nextUrl.searchParams.get('plan')
  const dealId = req.nextUrl.searchParams.get('deal')
  const payload = await getPayload({ config })

  const providers = await payload.find({ collection: 'providers', where: { slug: { equals: slug } }, limit: 1 })
  const provider = providers.docs[0]
  if (!provider) return NextResponse.redirect(new URL('/', req.url), 302)

  let target = provider.affUrl || provider.website

  if (planId) {
    try {
      const plan = await payload.findByID({ collection: 'plans', id: planId })
      const planProviderId = typeof plan.provider === 'object' ? plan.provider?.id : plan.provider
      if (planProviderId === provider.id && plan.affUrl) target = plan.affUrl
    } catch {
      // 套餐不存在则回落到服务商链接
    }
  }

  if (dealId) {
    try {
      const deal = await payload.findByID({ collection: 'deals', id: dealId })
      const dealProviderId = typeof deal.provider === 'object' ? deal.provider?.id : deal.provider
      if (dealProviderId === provider.id && deal.url) target = deal.url
    } catch {
      // 优惠不存在则回落
    }
  }

  if (!target) return NextResponse.redirect(new URL(`/providers/${slug}`, req.url), 302)
  return NextResponse.redirect(target, 302)
}
