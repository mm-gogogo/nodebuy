import { isValidSlug } from './slug'
import { payLabels } from './labels'

export const MAX_COMPARE_PROVIDERS = 4

// 解析 /compare-providers?slugs=a,b,c:去重、校验 slug 合法、保序、限量。纯函数。
export function parseProviderSlugs(param: string | null | undefined, max = MAX_COMPARE_PROVIDERS): string[] {
  if (!param) return []
  const seen = new Set<string>()
  const out: string[] = []
  for (const part of param.split(',')) {
    const s = part.trim()
    if (s && isValidSlug(s) && !seen.has(s)) {
      seen.add(s)
      out.push(s)
      if (out.length >= max) break
    }
  }
  return out
}

export interface CompareProvider {
  name: string
  slug: string
  brandColor?: string | null
  overallScore?: number | null
  scores?: {
    performance?: number | null
    network?: number | null
    value?: number | null
    support?: number | null
  } | null
  founded?: number | null
  headquarters?: string | null
  paymentMethods?: string[] | null
  datacenterCount: number
  cnOptimized: boolean
}

export interface CompareRow {
  label: string
  values: string[]
}

const score = (n?: number | null) => (n != null ? n.toFixed(1) : '—')

export function compareProviderRows(providers: CompareProvider[]): CompareRow[] {
  const col = <T,>(fn: (p: CompareProvider) => T) => providers.map(fn)
  return [
    { label: '综合评分', values: col((p) => score(p.overallScore)) },
    { label: '性能', values: col((p) => score(p.scores?.performance)) },
    { label: '网络', values: col((p) => score(p.scores?.network)) },
    { label: '性价比', values: col((p) => score(p.scores?.value)) },
    { label: '售后', values: col((p) => score(p.scores?.support)) },
    { label: '成立', values: col((p) => (p.founded != null ? String(p.founded) : '—')) },
    { label: '总部', values: col((p) => p.headquarters || '—') },
    {
      label: '付款',
      values: col((p) => (p.paymentMethods?.length ? p.paymentMethods.map((m) => payLabels[m] || m).join(' · ') : '—')),
    },
    { label: '机房数', values: col((p) => String(p.datacenterCount)) },
    { label: '大陆优化', values: col((p) => (p.cnOptimized ? '✓' : '—')) },
  ]
}
