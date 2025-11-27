import { supabase } from '@/lib/db'

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

const getSignedUrl = async (file) => {
  const { data: signedUrlData, error: urlError } = await supabase.storage
    .from(file.bucket_id)
    .createSignedUrl(file.file_name, 60) // 60s expiration
  if (urlError) throw urlError
  return {
    ...file,
    signed_url: signedUrlData.signedUrl,
  }
}
