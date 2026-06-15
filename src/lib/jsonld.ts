// 结构化数据(JSON-LD)构造工具。URL 用绝对地址,便于搜索引擎归一。

const siteUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

export function absUrl(path: string): string {
  return path.startsWith('http') ? path : `${siteUrl}${path.startsWith('/') ? '' : '/'}${path}`
}

export interface Crumb {
  name: string
  path: string
}

// 面包屑结构化数据:让搜索结果展示「首页 › 测评 › 标题」而非裸 URL。
export function breadcrumbList(crumbs: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: absUrl(c.path),
    })),
  }
}
