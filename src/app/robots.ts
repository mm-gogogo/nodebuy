import type { MetadataRoute } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // AFF 跳转、后台/API、搜索结果页不进索引
        disallow: ['/admin', '/api/', '/go/', '/search'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
