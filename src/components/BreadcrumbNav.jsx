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
  const segments = ['home/jonathan', ...currentPath.split('/').filter(Boolean)]
  let currentChildren = tree
  const breadcrumb = []

  let runningPath = ''

  for (const seg of segments) {
    runningPath += '/' + seg

    const match = currentChildren.find((n) => n.name === seg)
    if (!match) break

    breadcrumb.push({
      name: match.name,
      path: match.path,
      siblings: currentChildren.filter((c) => c.path && c.path !== match.path),
    })

    currentChildren = match.children
  }

  return breadcrumb
}

export default function BreadcrumbClient({ tree }) {
  const path = usePathname()

  const steps = path.split('/').filter(Boolean)
  let currentTree = tree[0]
  steps.forEach((step) => {
    currentTree = currentTree.children.find((child) => child.name === step)
  })
  const breadcrumb = findBreadcrumbInfo(tree, path)

  return (
    <BreadcrumbList>
      {breadcrumb.map((item, i) => {
        const breadcrumbLink = (
          <BreadcrumbLink href={item.path}>{item.name}</BreadcrumbLink>
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
