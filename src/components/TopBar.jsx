'use server'
import ThemeToggle from '@/components/ThemeToggle'
import BreadcrumbNav from '@/components/BreadcrumbNav'
import { buildRouteTree } from '@/helpers/route'

export default async function TopBar() {
  const fullTree = [
    { name: 'home/jonathan', path: '/', children: buildRouteTree() },
  ]

  console.log(JSON.stringify(fullTree, null, 2))

  return (
    <header className="h-1/10 top-0 z-20 w-full border-b border-text/30 bg-background/20 backdrop-blur">
      <div className="mx-auto flex items-center h-full justify-between px-4">
        <BreadcrumbNav tree={fullTree} />
      </div>
    </header>
  )
}
