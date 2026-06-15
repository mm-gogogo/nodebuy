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
