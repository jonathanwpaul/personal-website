import fs from 'fs'
import path from 'path'

export function buildRouteTree(
  appDir = path.join(process.cwd(), 'src/app'),
  basePath = '',
) {
  const entries = fs.readdirSync(appDir, { withFileTypes: true })

  const searched = entries
    .filter(
      (e) =>
        e.isDirectory() &&
        !e.name.startsWith('[') &&
        !e.name.startsWith('(') &&
        e.name !== 'api',
    )
    .map((dir) => {
      const fullPath = path.join(appDir, dir.name)
      const routePath = `${basePath}/${dir.name}`

      const hasPage = fs.existsSync(path.join(fullPath, 'page.js'))

      const children = buildRouteTree(fullPath, routePath)

      return {
        name: dir.name,
        path: hasPage ? routePath : '',
        children,
      }
    })

  return searched
}
