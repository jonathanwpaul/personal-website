#!/usr/bin/env node

/**
 * sync-printables.js — Idempotent sync from Printables profile to local DB + storage
 *
 * Usage:
 *   node scripts/sync-printables.js
 *
 * Requires:
 *   - .env with SUPABASE_URL and SUPABASE_KEY
 *   - @supabase/supabase-js (listed in package.json)
 *
 * What it does:
 *   1. Fetches https://www.printables.com/@jonathan_542538/models
 *   2. Extracts all model links
 *   3. Queries existing projects from Supabase — matches on web_link
 *   4. For each NEW model:
 *      a. Fetches the model detail page
 *      b. Extracts title, summary, og:image, description HTML
 *      c. Inserts into project table
 *      d. Downloads thumbnail → uploads to supabase storage
 *      e. Creates markdown file at public/content/projects/{slug}.md
 *   5. Reports summary of what was added / skipped
 */

import { createClient } from '@supabase/supabase-js'
import { readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'

// --- Config ---
const PRINTABLES_USER = 'jonathan_542538'
const PROFILE_URL = `https://www.printables.com/@${PRINTABLES_USER}/models`
const BUCKET = 'project_files'
const MARKDOWN_DIR = 'public/content/projects'

const SCRAPE_DELAY_MS = 1000 // polite delay between page fetches
// Skip these model paths (e.g. obsolete versions already superseded in DB)
const EXCLUDE_PATHS = new Set([
  '/model/752502-kickstand-for-samsung-galaxy-tab-s9-ultra', // v1 superseded by v2 (id=6)
])

// --- Bootstrap ---
const envRaw = await readFile('.env', 'utf-8')
const env = Object.fromEntries(
  envRaw
    .split('\n')
    .filter(Boolean)
    .map((l) => {
      const eq = l.indexOf('=')
      return [l.slice(0, eq), l.slice(eq + 1)]
    }),
)

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY)

// --- Helpers ---

async function fetchText(url) {
  const resp = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SyncScript/1.0)' },
  })
  if (!resp.ok) throw new Error(`Fetch ${url} failed: ${resp.status}`)
  return resp.text()
}

function extractMeta(html, name) {
  const m = html.match(
    new RegExp(`<meta\\s+name="${name}"\\s+content="([^"]*)"`, 'i'),
  )
  return m ? m[1] : null
}

function extractModels(html) {
  const links = html.match(/href="\/model\/\d+[^"]*"/g)
  if (!links) return []
  return [...new Set(links)].map((l) => {
    const path = l.replace(/^href="/, '').replace(/"$/, '')
    return { url: `https://www.printables.com${path}`, path }
  })
}

function extractTitle(html) {
  const m = html.match(
    /<h1(?:\s[^>]*)?>([\s\S]*?)<\/h1>/,
  )
  if (!m) return null
  return m[1].replace(/<[^>]+>/g, '').trim()
}

function extractSummary(html) {
  const m = html.match(
    /<div class="summary[^"]*"[^>]*>[\s\S]*?<!--\[-->(.*?)<!--\]-->/,
  )
  if (m) return m[1].trim()
  // fallback: try ld+json description
  const ld = html.match(
    /"description":"([^"]*)"/,
  )
  return ld ? ld[1] : null
}

function extractOgImage(html) {
  return extractMeta(html, 'og:image')
}

function extractDescriptionHtml(html) {
  // The description is inside <div class="user-inserted"> ... <html><body>content</body></html> ...
  const m = html.match(
    /<div class="user-inserted[^"]*"[^>]*>[\s\S]*?<body>([\s\S]*?)<\/body>[\s\S]*?<\/html>[\s\S]*?<!--\]-->[\s\S]*?<\/div>/,
  )
  if (!m) return null
  // Extract the inner body content
  const bodyM = m[0].match(/<body>([\s\S]*?)<\/body>/)
  if (!bodyM) return null

  let content = bodyM[1]
  // Remove script tags and their contents
  content = content.replace(/<script[\s\S]*?<\/script>/g, '')
  return content.trim()
}

function htmlToMarkdown(html) {
  if (!html) return ''
  let md = html
    // Convert <h3> to markdown heading
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '### $1\n')
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '## $1\n')
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '# $1\n')
    // Convert <p> with newlines
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '$1\n\n')
    // Convert <ul> / <li>
    .replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, list) =>
      list.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n'),
    )
    .replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, list) => {
      let i = 1
      return list.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, () => `${i++}. $1\n`)
    })
    // Convert <a>
    .replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)')
    // Convert <strong>/<b>
    .replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, '**$2**')
    // Convert <em>/<i>
    .replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, '*$2*')
    // Convert <br>
    .replace(/<br\s*\/?>/gi, '\n')
    // Convert <blockquote>
    .replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, q) =>
      q
        .split('\n')
        .map((l) => (l.trim() ? `> ${l}` : '>'))
        .join('\n') + '\n\n',
    )
    // Convert <figure> with <img>
    .replace(/<figure[^>]*>([\s\S]*?)<\/figure>/gi, '$1')
    // Convert <img>
    .replace(/<img[^>]*src="([^"]*)"[^>]*>/gi, '![]($1)')
    // Convert tables (simplistic)
    .replace(/<table[^>]*>/gi, '')
    .replace(/<\/table>/gi, '')
    .replace(/<thead[^>]*>([\s\S]*?)<\/thead>/gi, '$1')
    .replace(/<tbody[^>]*>([\s\S]*?)<\/tbody>/gi, '$1')
    .replace(/<tr[^>]*>/gi, '')
    .replace(/<\/tr>/gi, '\n')
    .replace(/<th[^>]*>([\s\S]*?)<\/th>/gi, '| $1 ')
    .replace(/<td[^>]*>([\s\S]*?)<\/td>/gi, '| $1 ')
    // Remove all remaining tags
    .replace(/<[^>]+>/g, '')
    // Clean whitespace
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .split('\n')
    .map((l) => l.trim())
    .join('\n')
    .trim()

  return md
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

// --- Main ---

async function main() {
  console.log('=== Printables Sync ===\n')

  // Step 1: Fetch profile page
  console.log('1. Fetching Printables profile...')
  const profileHtml = await fetchText(PROFILE_URL)
  const models = extractModels(profileHtml)
  console.log(`   Found ${models.length} models on profile\n`)

  // Step 2: Fetch existing projects from Supabase
  console.log('2. Querying existing projects from Supabase...')
  const { data: existingProjects, error: dbError } = await supabase
    .from('project')
    .select('id, name, web_link')

  if (dbError) {
    console.error('   DB query failed:', dbError.message)
    process.exit(1)
  }

  const existingLinks = new Set(
    existingProjects.map((p) => p.web_link).filter(Boolean),
  )
  const existingNames = new Set(existingProjects.map((p) => p.name))
  console.log(`   ${existingProjects.length} projects in DB\n`)

  // Step 3: Find new models
  const newModels = models.filter(
    (m) => !existingLinks.has(m.url) && !EXCLUDE_PATHS.has(m.path),
  )
  const skippedModels = models.filter(
    (m) => !existingLinks.has(m.url) && EXCLUDE_PATHS.has(m.path),
  )
  if (skippedModels.length > 0) {
    for (const m of skippedModels) {
      console.log(`   SKIP (excluded): ${m.path}`)
    }
  }
  console.log(`3. ${newModels.length} new models to add\n`)

  if (newModels.length === 0) {
    console.log('   Nothing to do! All models already synced.')
    return
  }

  // Step 4: Process each new model
  const results = []

  for (const model of newModels) {
    console.log(`\n--- Processing: ${model.path} ---`)

    try {
      await wait(SCRAPE_DELAY_MS)

      // 4a. Fetch model detail page
      console.log('   Fetching model page...')
      const pageHtml = await fetchText(model.url)

      // 4b. Extract fields
      const title = extractTitle(pageHtml)
      const summary = extractSummary(pageHtml)
      const ogImage = extractOgImage(pageHtml)
      const descHtml = extractDescriptionHtml(pageHtml)

      if (!title) {
        console.log('   SKIP: Could not extract title')
        continue
      }

      const slug = slugify(title)
      const prettyName = title
      const description = summary || ''
      const webLink = model.url

      // 4c. Check if slug already exists (duplicate name check)
      if (existingNames.has(slug)) {
        console.log(`   SKIP: Slug "${slug}" already exists in DB`)
        results.push({ path: model.path, status: 'skipped', reason: 'slug exists' })
        continue
      }

      // 4d. Insert into project table
      console.log(`   Inserting: "${prettyName}"`)
      const { data: inserted, error: insertError } = await supabase
        .from('project')
        .insert({
          name: slug,
          pretty_name: prettyName,
          description: description,
          web_link: webLink,
          status: 'completed',
        })
        .select()

      if (insertError) {
        console.error(`   FAILED to insert: ${insertError.message}`)
        results.push({ path: model.path, status: 'error', reason: insertError.message })
        continue
      }

      const projectId = inserted[0].id
      existingNames.add(slug)
      console.log(`   Inserted with id=${projectId}`)

      // 4e. Download and upload thumbnail
      if (ogImage) {
        try {
          console.log('   Downloading thumbnail...')
          const imgResp = await fetch(ogImage)
          if (imgResp.ok) {
            const imgBuffer = Buffer.from(await imgResp.arrayBuffer())
            const ext = ogImage.match(/\.(jpg|jpeg|png|webp)(?:\?|$)/i)?.[1] || 'jpg'
            const storagePath = `projects/${slug}/thumbnail.${ext}`

            console.log('   Uploading to Supabase storage...')
            const { error: uploadError } = await supabase.storage
              .from(BUCKET)
              .upload(storagePath, imgBuffer, {
                contentType: imgResp.headers.get('content-type') || `image/${ext}`,
                upsert: true,
              })

            if (uploadError) {
              console.error(`   Thumbnail upload failed: ${uploadError.message}`)
            } else {
              // Link to project_files table
              const { data: obj } = await supabase
                .storage
                .from(BUCKET)
                .getPublicUrl(storagePath)

              // Get the storage object ID by querying
              const { data: storageObj } = await supabase
                .from('storage.objects')
                .select('id')
                .eq('name', storagePath)
                .eq('bucket_id', BUCKET)
                .maybeSingle()

              if (storageObj) {
                const { error: linkError } = await supabase
                  .from('project_files')
                  .insert({ project_id: projectId, file_id: storageObj.id })

                if (linkError) {
                  console.error(`   project_files link failed: ${linkError.message}`)
                } else {
                  console.log('   Thumbnail linked to project')
                }
              }
            }
          }
        } catch (thumbError) {
          console.error(`   Thumbnail processing failed: ${thumbError.message}`)
        }
      }

      // 4f. Create markdown file
      const mdContent = htmlToMarkdown(descHtml) || description
      const mdFilePath = `${MARKDOWN_DIR}/${slug}.md`

      if (!existsSync(mdFilePath)) {
        await writeFile(mdFilePath, mdContent + '\n', 'utf-8')
        console.log(`   Created markdown: ${mdFilePath}`)
      } else {
        console.log(`   Markdown exists (skipped): ${mdFilePath}`)
      }

      results.push({ path: model.path, status: 'added', id: projectId })
    } catch (err) {
      console.error(`   ERROR processing ${model.path}: ${err.message}`)
      results.push({ path: model.path, status: 'error', reason: err.message })
    }
  }

  // --- Summary ---
  console.log('\n\n=== Summary ===')
  console.log(`Total models on profile: ${models.length}`)
  console.log(`Existing in DB:          ${existingProjects.length}`)
  console.log(`New found:               ${newModels.length}`)
  console.log('')

  for (const r of results) {
    const icon = r.status === 'added' ? '✅' : r.status === 'skipped' ? '⏭️' : '❌'
    console.log(`${icon} ${r.path} — ${r.status}${r.id ? ` (id=${r.id})` : ''}${r.reason ? ` — ${r.reason}` : ''}`)
  }
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
