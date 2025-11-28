import ThemeToggle from '@/components/ThemeToggle'
import BreadcrumbNav from '@/components/BreadcrumbNav'
import fs from 'fs'
import path from 'path'

// Build tree (same as RoutesTree)
function buildTree(dirPath, rel = '') {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true })
  const ignored = new Set(['api', 'lib', 'components', 'providers', 'public'])

  const hasPage = entries.some(
    (e) => e.isFile() && /^page\.(js|jsx|ts|tsx)$/.test(e.name)
  )

  const children = []
  for (const e of entries) {
    if (!e.isDirectory()) continue
    if (e.name.includes('[') || e.name.includes(']')) continue
    if (ignored.has(e.name)) continue
    try {
      const child = buildTree(
        path.join(dirPath, e.name),
        rel ? rel + '/' + e.name : e.name
      )
      if (child) children.push(child)
    } catch (err) {
      // ignore
    }
  }

  if (!hasPage && children.length === 0) return null

  return {
    name: path.basename(rel),
    route: '/' + (rel || ''),
    hasPage,
    children,
  }
}

// Serialize tree to JSON for client component
function serializeTree(tree) {
  if (!tree) return null
  return {
    name: tree.name,
    route: tree.route,
    hasPage: tree.hasPage,
    children: tree.children.map(serializeTree),
  }
}

export default function TopBar() {
  let tree = null

  try {
    const appDir = path.join(process.cwd(), 'src', 'app')
    tree = buildTree(appDir, '')
  } catch (err) {
    console.error('TopBar tree error:', err)
  }

  const serializedTree = serializeTree(tree)

  return (
    <header className="sticky top-0 z-20 w-full border-b border-text/30 bg-background/20 backdrop-blur">
      <div className="mx-auto flex items-center h-full justify-between px-4">
        <BreadcrumbNav tree={serializedTree} />
        <ThemeToggle className="ml-4" />
      </div>
    </header>
  )
}
