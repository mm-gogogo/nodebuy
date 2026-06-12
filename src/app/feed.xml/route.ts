import { getPayload } from 'payload'
import config from '@payload-config'

const siteUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

export const revalidate = 300

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

export async function GET() {
  const payload = await getPayload({ config })
  const reviews = await payload.find({
    collection: 'reviews',
    limit: 30,
    sort: '-publishedAt',
    where: { _status: { equals: 'published' } },
  })

  const items = reviews.docs
    .map((r) => {
      const provider = typeof r.provider === 'object' ? r.provider : null
      const link = `${siteUrl}/reviews/${r.slug}`
      return [
        '    <item>',
        `      <title>${escapeXml(r.title)}</title>`,
        `      <link>${escapeXml(link)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(link)}</guid>`,
        r.excerpt ? `      <description>${escapeXml(r.excerpt)}</description>` : null,
        provider ? `      <category>${escapeXml(provider.name)}</category>` : null,
        r.publishedAt ? `      <pubDate>${new Date(r.publishedAt).toUTCString()}</pubDate>` : null,
        '    </item>',
      ]
        .filter(Boolean)
        .join('\n')
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>NodeBuy · 服务器测评与榜单</title>
    <link>${escapeXml(siteUrl)}</link>
    <description>NodeBuy 最新 VPS 与独立服务器实测报告</description>
    <language>zh-cn</language>
    <atom:link href="${escapeXml(`${siteUrl}/feed.xml`)}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  })
}
