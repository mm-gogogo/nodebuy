import React from 'react'
import Link from 'next/link'
import './styles.css'

import type { Metadata } from 'next'
import { ThemeToggle } from '@/components/ThemeToggle'
import { THEME_INIT_SCRIPT } from '@/lib/theme'

const siteUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'NodeBuy · 服务器测评与榜单',
    template: '%s · NodeBuy',
  },
  description:
    'NodeBuy 持续跑分测评海内外 VPS 与独立服务器，按线路、性能、性价比维护榜单，并同步整理在售优惠码。',
  openGraph: {
    siteName: 'NodeBuy',
    type: 'website',
    locale: 'zh_CN',
  },
  alternates: {
    types: { 'application/rss+xml': '/feed.xml' },
  },
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* 刻意用 <link> 而非 next/font：字体含 Noto Sans SC（CJK），用 next/font 自托管会
            把数 MB 的中文字体打进构建产物；交给 Google 按子集分发更合适。 */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
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
              <Link href="/guide">选购</Link>
            </li>
            <li>
              <Link href="/rankings">榜单</Link>
            </li>
            <li>
              <Link href="/reviews">测评</Link>
            </li>
            <li>
              <Link href="/plans">套餐</Link>
            </li>
            <li>
              <Link href="/lines">线路</Link>
            </li>
            <li>
              <Link href="/providers">服务商</Link>
            </li>
            <li>
              <Link href="/deals">优惠</Link>
            </li>
          </ul>
          <form className="nav-search" action="/search" role="search">
            <input type="search" name="q" placeholder="搜索…" aria-label="站内搜索" />
          </form>
          <ThemeToggle />
        </nav>
        <main>{children}</main>
        <footer className="foot-line">
          <div className="wrap">
            <p>
              <span>© 2026 NodeBuy</span>
              <span>测评数据均为本站实测，跑分环境见各篇说明</span>
              <span className="aff-note">部分外链为推广链接（AFF），不影响测评结论</span>
              <Link href="/search">搜索</Link>
              <Link href="/regions">机房地区</Link>
              <Link href="/favorites">我的收藏</Link>
              <Link href="/admin">管理后台</Link>
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}
