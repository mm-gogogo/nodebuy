import { getPayload } from 'payload'
import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'

import { normalizeAffUrl, resolveAffTarget, type AffDeal, type AffPlan } from '@/lib/aff'

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

  let plan: AffPlan | null = null
  if (planId) {
    try {
      const doc = await payload.findByID({ collection: 'plans', id: planId })
      const planProviderId = typeof doc.provider === 'object' ? doc.provider?.id : doc.provider
      if (planProviderId === provider.id) plan = doc
    } catch {
      // 套餐不存在则忽略
    }
  }

  let deal: AffDeal | null = null
  if (dealId) {
    try {
      const doc = await payload.findByID({ collection: 'deals', id: dealId })
      const dealProviderId = typeof doc.provider === 'object' ? doc.provider?.id : doc.provider
      if (dealProviderId === provider.id) deal = doc
    } catch {
      // 优惠不存在则忽略
    }
  }

  // 收敛为绝对 http(s) URL；非法或缺失时回落到服务商页，避免 redirect 抛错 500。
  const target = normalizeAffUrl(resolveAffTarget(provider, plan, deal))
  if (!target) return NextResponse.redirect(new URL(`/providers/${slug}`, req.url), 302)
  return NextResponse.redirect(target, 302)
}
