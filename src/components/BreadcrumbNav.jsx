'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useState, useRef, useEffect, useMemo } from 'react'

// Build a flat map of route -> node from the serialized tree for fast lookups
function buildRouteMap(tree, map = new Map()) {
  if (!tree) return map
  map.set(tree.route, tree)
  for (const child of tree.children || []) {
    buildRouteMap(child, map)
  }
  return map
}

function BreadcrumbDropdown({ node, route }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)
  const buttonRef = useRef(null)

  // close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      // If click is inside the original container or the button, don't close
      if (
        (containerRef.current && containerRef.current.contains(e.target)) ||
        (buttonRef.current && buttonRef.current.contains(e.target))
      ) {
        return
      }
      setOpen(false)
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  // No JS positioning required — CSS will handle positioning of the dropdown.

  const dropdown = (
    <div ref={containerRef} className="inline-block relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen((s) => !s)}
        aria-expanded={open}
        className="hover:underline cursor-pointer"
      >
        {node.name}
      </button>
      {open ? (
        <div className="absolute left-0 top-full z-50 mt-2">
          <div className="bg-background border border-text/30 rounded shadow-lg w-max">
            <ul className="min-w-max">
              {node?.hasPage && (
                <li>
                  <Link
                    href={route}
                    className="block px-3 py-2 hover:bg-primary/10"
                  >
                    {route}
                  </Link>
                </li>
              )}
              {node?.children &&
                node.children.map((child) => (
                  <li key={child.route}>
                    <Link
                      href={child.route}
                      className="block px-3 py-2 hover:bg-primary/10"
                    >
                      {child.route}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  )

  return dropdown
}

export default function BreadcrumbNav({ tree }) {
  const pathname = usePathname()
  const segments = []
  pathname
    .split('/')
    .filter(Boolean)
    .forEach((path) => segments.push(path))

  const crumbs = []

  let accumulated = ''
  segments.forEach((seg) => {
    accumulated += `/${seg}`
    const label = decodeURIComponent(seg)
    crumbs.push({ label, route: accumulated })
  })

  // memoized flat map for quick node lookup
  const routeMap = useMemo(() => buildRouteMap(tree), [tree])

  return (
    <nav className="font-mono text-sm text-text/90" aria-label="Breadcrumb">
      <div className="breadcrumbs">
        <ul>
          <li key="home">home</li>
          <li key="jonathan">
            {
              <BreadcrumbDropdown
                node={{ ...tree, name: 'jonathan' }}
                route="/"
              />
            }
          </li>
          {crumbs.map((c, idx) => {
            const isLast = idx === crumbs.length - 1
            const node = c.route ? routeMap.get(c.route) : null

            let content = null
            if (isLast) {
              content = <p className="text-primary">{c.label}</p>
            } else {
              content = <BreadcrumbDropdown node={node} route={c.route} />
            }

            return <li key={c.route || idx}>{content}</li>
          })}
        </ul>
      </div>
    </nav>
  )
}
