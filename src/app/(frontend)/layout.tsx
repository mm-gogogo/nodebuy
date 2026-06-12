import React from 'react'
import Link from 'next/link'
import './styles.css'

export const metadata = {
  title: {
    default: 'NodeBuy · 服务器测评与榜单',
    template: '%s · NodeBuy',
  },
  description:
    'NodeBuy 持续跑分测评海内外 VPS 与独立服务器，按线路、性能、性价比维护榜单，并同步整理在售优惠码。',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@400..700&family=Geist+Mono:wght@400..700&family=Noto+Sans+SC:wght@400..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <nav className="nav-pill" aria-label="主导航">
          <Link className="wordmark" href="/">
            NodeBuy
          </Link>
          <ul className="nav-pill__links">
            <li>
              <Link href="/rankings">榜单</Link>
            </li>
            <li>
              <Link href="/reviews">测评</Link>
            </li>
            <li>
              <Link href="/deals">优惠</Link>
            </li>
          </ul>
        </nav>
        <main>{children}</main>
        <footer className="foot-line">
          <div className="wrap">
            <p>
              <span>© 2026 NodeBuy</span>
              <span>测评数据均为本站实测，跑分环境见各篇说明</span>
              <span className="aff-note">部分外链为推广链接（AFF），不影响测评结论</span>
              <a href="/admin">管理后台</a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}
