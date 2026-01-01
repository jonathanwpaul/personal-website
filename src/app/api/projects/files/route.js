import { supabase } from '@/db'
import { getSignedUrl } from '@/utils'

export async function POST(req) {
  const project_id = await req.text()

  const { data, error } = await supabase.rpc('get_project_files', {
    project: project_id,
  })

  if (error) {
    return new Response(null, {
      status: 500,
      statusText: 'Unable to load project files',
    })
  }

  if (!Array.isArray(data) || data.length === 0) {
    return Response.json([])
  }

  const filesWithSignedUrls = await Promise.all(
    data.map(async (file) => {
      try {
        const withSignedUrl = await getSignedUrl(file)
        return withSignedUrl
      } catch (e) {
        // If a single file fails to sign, skip it but continue returning others
        return null
      }
    }),
  )

  const validFiles = filesWithSignedUrls.filter(Boolean)

  return Response.json(validFiles)
}
