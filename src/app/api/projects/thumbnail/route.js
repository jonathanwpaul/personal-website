import { supabase } from '@/db'
import { getSignedUrl } from '@/utils'

/**
 * Returns a signed URL for a thumbnail file in a project's folder.
 * A thumbnail is any file whose name starts with `thumbnail.` (any extension).
 *
 * Body: single project_id as plain text → returns plain URL (backward compatible)
 * Body: JSON array of project_ids → returns { [project_id]: signed_url | null }
 */
export async function POST(req) {
  const body = await req.text()

  let projectIds
  try {
    const parsed = JSON.parse(body)
    projectIds = Array.isArray(parsed) ? parsed : [body]
  } catch {
    projectIds = [body]
  }

  const results = await Promise.all(
    projectIds.map(async (id) => {
      try {
        const { data, error } = await supabase.rpc('get_project_files', {
          project: id,
        })

        if (error || !Array.isArray(data)) return [id, null]

        const match = data.find((f) =>
          /(?:^|\/)thumbnail\.[^./]+$/i.test(f.file_name),
        )

        if (!match) return [id, null]

        const withSignedUrl = await getSignedUrl(match)
        return [id, withSignedUrl.signed_url]
      } catch {
        return [id, null]
      }
    }),
  )

  // Single ID request (plain text, not JSON array) → return plain URL
  if (projectIds.length === 1 && !body.startsWith('[')) {
    const url = results[0][1]
    return new Response(url || '', { status: url ? 200 : 204 })
  }

  // Batch request → return map
  return Response.json(Object.fromEntries(results.filter(([, v]) => v !== null)))
}
