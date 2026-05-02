import { readFileSync } from 'fs'
import { join } from 'path'

export async function GET() {
  const html = readFileSync(join(process.cwd(), 'src/app/resume/resume.html'), 'utf-8')
  return new Response(html, {
    headers: { 'Content-Type': 'text/html' },
  })
}
