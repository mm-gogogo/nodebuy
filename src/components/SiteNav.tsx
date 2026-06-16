'use client'

import React, { useState } from 'react'
import Link from 'next/link'

import { ThemeToggle } from '@/components/ThemeToggle'

const LINKS = [
  { href: '/guide', label: '选购' },
  { href: '/rankings', label: '榜单' },
  { href: '/reviews', label: '测评' },
  { href: '/benchmarks', label: '跑分' },
  { href: '/plans', label: '套餐' },
  { href: '/lines', label: '线路' },
  { href: '/providers', label: '服务商' },
  { href: '/deals', label: '优惠' },
]

export function SiteNav() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        className="nav-burger"
        aria-expanded={open}
        aria-controls="nav-collapse"
        aria-label={open ? '收起菜单' : '展开菜单'}
        onClick={() => setOpen((v) => !v)}
      >
        <span aria-hidden="true">{open ? '✕' : '☰'}</span>
      </button>

      <div id="nav-collapse" className={`nav-collapse${open ? ' is-open' : ''}`}>
        <ul className="nav-pill__links">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <form className="nav-search" action="/search" role="search">
          <input type="search" name="q" placeholder="搜索…" aria-label="站内搜索" />
        </form>
      </div>

      <ThemeToggle />
    </>
  )
}
