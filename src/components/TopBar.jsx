import ThemeToggle from '@/components/ThemeToggle'
import BreadcrumbNav from '@/components/BreadcrumbNav'
import { buildRouteTree } from '@/helpers/route'

export default function TopBar() {
  const fullTree = [
    { name: 'home/jonathan', path: '/', children: buildRouteTree() },
  ]

  return (
    <header className="sticky h-[30px] top-0 z-20 w-full border-b border-text/30 bg-background/20 backdrop-blur">
      <div className="mx-auto flex items-center h-full justify-between px-4">
        <BreadcrumbNav tree={fullTree} />
      </div>
    </header>
  )
}
