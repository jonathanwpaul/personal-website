'use client'
import ThemeToggle from '@/components/ThemeToggle'
import { usePathname } from 'next/navigation'

function formatPath(pathname) {
  // remove trailing slash (except root), keep segments
  if (!pathname || pathname === '/') return ''
  const paths = pathname.split('/')
  return (
    <h1>
      ~/jonathan
      <span>{paths.slice(0, paths.length - 1).join('/')}/</span>
      <span className="text-primary">{paths[paths.length - 1]}</span>
    </h1>
  )
}

export default function TopBar() {
  const pathname = usePathname()
  const path = formatPath(pathname)

  return (
    <header className="sticky top-0 h-[5%] z-40 w-full border-b border-primary/30 bg-background/80 backdrop-blur">
      <div className="mx-auto flex items-center h-full justify-between px-4">
        <div className="font-mono text-sm text-text/90">{path}</div>
        <ThemeToggle className="ml-4" />
      </div>
    </header>
  )
}
