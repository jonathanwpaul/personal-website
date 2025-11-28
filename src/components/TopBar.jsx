'use client'
import ThemeToggle from '@/components/ThemeToggle'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

function formatPath(pathname) {
  // Always show a root entry and then each segment as clickable items
  const segments =
    pathname && pathname !== '/' ? pathname.split('/').filter(Boolean) : []

  // Build crumbs array with { label, href }
  const crumbs = []
  // Root - show as ~/jonathan to keep prior styling intent
  crumbs.push({ label: '~' })
  crumbs.push({ label: 'jonathan', href: '/' })

  let accumulated = ''
  segments.forEach((seg) => {
    accumulated += `/${seg}`
    // decode URI components for readability
    const label = decodeURIComponent(seg)
    crumbs.push({ label, href: accumulated })
  })

  return (
    <nav className="font-mono text-sm text-text/90" aria-label="Breadcrumb">
      <div className="breadcrumbs">
        <ul>
          {crumbs.map((c, idx) => {
            const isLast = idx === crumbs.length - 1
            const isFirst = idx === 0
            return (
              <li key={c.href}>
                {isFirst && <p className="">{c.label}</p>}
                {isLast && <p className="text-primary">{c.label}</p>}
                {!isLast && !isFirst && <Link href={c.href}>{c.label}</Link>}
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}

export default function TopBar() {
  const pathname = usePathname()
  const path = formatPath(pathname)

  return (
    <header className="absolute top-0 z-20 w-full border-b border-text/30 bg-background/20 backdrop-blur">
      <div className="mx-auto flex items-center h-full justify-between px-4">
        <div>{path}</div>
        <ThemeToggle className="ml-4" />
      </div>
    </header>
  )
}
