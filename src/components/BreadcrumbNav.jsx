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
  // Ensure we always work with an array of path segments, even if currentPath is missing
  const safePath = typeof currentPath === 'string' ? currentPath : ''
  const segments = ['home/jonathan', ...safePath.split('/').filter(Boolean)]

  // Normalise the route tree so we always have an array to work with
  let currentChildren = Array.isArray(tree) ? tree : []
  const breadcrumb = []

  let match
  let runningPath = ''

  for (const seg of segments) {
    runningPath += '/' + seg

    match = currentChildren.find((n) => n.name === seg)
    if (!match) {
      break
    }

    const siblings = Array.isArray(currentChildren)
      ? currentChildren.filter((c) => c.path && c.path !== match.path)
      : []

    breadcrumb.push({
      name: match.name,
      path: match.path,
      siblings,
    })

    // Ensure children is always an array for the next loop iteration
    currentChildren = Array.isArray(match.children) ? match.children : []
  }

  if (Array.isArray(match?.children) && match.children.length > 0) {
    breadcrumb.push({
      name: '...',
      siblings: match.children,
    })
  }

  return breadcrumb
}

export default function BreadcrumbClient({ tree }) {
  const path = usePathname()

  const steps = path.split('/').filter(Boolean)

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
