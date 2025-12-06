import { supabase } from '@/db'
import { getSignedUrl } from '@/utils'

export async function POST(req) {
  const project_id = await req.text()
  const { data, error } = await supabase.rpc('get_project_files', {
    project: project_id,
  })

  if (!error && Array.isArray(data)) {
    const match = data.find((f) => /(gltf|glb)$/i.test(f.file_name))
    if (match) {
      const withSignedUrl = await getSignedUrl(match)
      return new Response(withSignedUrl.signed_url)
    }
  }

  return new Response(null, { statusText: 'File not found' })
}
