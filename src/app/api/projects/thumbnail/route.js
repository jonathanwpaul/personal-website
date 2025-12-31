import { supabase } from '@/db'
import { getSignedUrl } from '@/utils'

// Returns a signed URL for a thumbnail file in a project's folder.
// A thumbnail is any file whose name starts with `thumbnail.` (any extension).
export async function POST(req) {
  const project_id = await req.text()

  const { data, error } = await supabase.rpc('get_project_files', {
    project: project_id,
  })

  if (!error && Array.isArray(data)) {
    const match = data.find((f) => /(?:^|\/)thumbnail\.[^./]+$/i.test(f.file_name))

    if (match) {
      const withSignedUrl = await getSignedUrl(match)
      return new Response(withSignedUrl.signed_url)
    }
  }

  // No thumbnail found; return 204 so callers can fall back to a placeholder
  return new Response(null, { status: 204, statusText: 'Thumbnail not found' })
}
