// AFF 跳转目标解析（纯函数，便于单测）。
// 优先级（高 → 低）：优惠级 url → 套餐级 affUrl → 服务商 affUrl → 服务商官网。
// 调用方负责确认 plan / deal 确实属于该 provider，不属于的传 null。

export interface AffProvider {
  affUrl?: string | null
  website?: string | null
}

export interface AffPlan {
  affUrl?: string | null
}

export interface AffDeal {
  url?: string | null
}

export function resolveAffTarget(
  provider: AffProvider,
  plan?: AffPlan | null,
  deal?: AffDeal | null,
): string | null {
  let target: string | null = provider.affUrl || provider.website || null
  if (plan?.affUrl) target = plan.affUrl
  if (deal?.url) target = deal.url
  return target
}

// 把后台可能填得不规范的链接收敛成可安全 302 的绝对 http(s) URL。
// 处理：已是绝对 URL 直接用；协议相对 //x → https:；裸域名 x.com/... → 补 https://。
// 无法收敛为 http(s) 的返回 null（调用方回落到服务商页，避免 NextResponse.redirect 抛错 500）。
export function normalizeAffUrl(raw: string | null | undefined): string | null {
  if (!raw) return null
  let candidate = raw.trim()
  if (!candidate) return null

  if (candidate.startsWith('//')) candidate = `https:${candidate}`
  else if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(candidate)) candidate = `https://${candidate}`

  try {
    const url = new URL(candidate)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    return url.toString()
  } catch {
    return null
  }
}
