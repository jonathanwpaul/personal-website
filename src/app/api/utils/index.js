import { supabase } from '@/db'

export const getSignedUrl = async (file) => {
  const { data: signedUrlData, error: urlError } = await supabase.storage
    .from(file.bucket_id)
    .createSignedUrl(file.file_name, 3600) // 1 hour expiration
  if (urlError) throw urlError
  return {
    ...file,
    signed_url: signedUrlData.signedUrl,
  }
}
