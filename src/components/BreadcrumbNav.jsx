'use client'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import React from 'react'
import { usePathname } from 'next/navigation'

export function findBreadcrumbInfo(tree, currentPath) {
  const safePath = typeof currentPath === 'string' ? currentPath : ''
  const segments = ['home/jonathan', ...safePath.split('/').filter(Boolean)]

  let currentChildren = Array.isArray(tree) ? tree : []
  const breadcrumb = []

  for (const seg of segments) {
    const match = currentChildren.find((n) => n.name === seg)

    if (!match) {
      // Dynamic or unregistered segment (e.g. a project slug) — show as current page
      breadcrumb.push({ name: seg, path: null, siblings: [] })
      break
    }

    const siblings = currentChildren.filter((c) => c.path && c.path !== match.path)
    breadcrumb.push({ name: match.name, path: match.path, siblings })
    currentChildren = Array.isArray(match.children) ? match.children : []
  }

  return breadcrumb
}

export default function BreadcrumbClient({ tree }) {
  const path = usePathname()
  const breadcrumb = findBreadcrumbInfo(tree, path)

  return (
    <BreadcrumbList>
      {breadcrumb.map((item, i) => {
        const breadcrumbLink = item.path ? (
          <BreadcrumbLink href={item.path}>{item.name}</BreadcrumbLink>
        ) : (
          <p>{item.name}</p>
        )
        const isLast = i === breadcrumb.length - 1
        return (
          <React.Fragment key={i}>
            <BreadcrumbItem
              className={`flex items-center gap-1 ${isLast ? 'text-primary' : ''}`}
            >
              {item.siblings.length === 0 ? (
                breadcrumbLink
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    {breadcrumbLink}
                  </DropdownMenuTrigger>

                  <DropdownMenuContent>
                    {item.siblings.map((sib) => (
                      <DropdownMenuItem key={sib.path} asChild>
                        <a href={sib.path}>{sib.name}</a>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </BreadcrumbItem>
            {!isLast && <BreadcrumbSeparator>/</BreadcrumbSeparator>}
          </React.Fragment>
        )
      })}
    </BreadcrumbList>
  )
}
