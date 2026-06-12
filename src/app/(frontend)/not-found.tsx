import React from 'react'
import Link from 'next/link'

export const metadata = { title: '页面不存在' }

export default function NotFound() {
  return (
    <div className="wrap">
      <header className="masthead">
        <h1>404 · 页面不存在</h1>
        <p className="lede">这一页可能已下架，或者链接拼错了。测评和榜单都还在原处。</p>
        <p style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-lg)' }}>
          <Link className="btn-ink" href="/">
            回首页
          </Link>
          <Link className="btn-ghost" href="/rankings">
            看榜单
          </Link>
        </p>
      </header>
    </div>
  )
}
