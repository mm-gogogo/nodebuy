import type { MetadataRoute } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // AFF 跳转与后台/API 不进索引
        disallow: ['/admin', '/api/', '/go/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
