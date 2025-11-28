import { supabase } from '@/db'

export const getSignedUrl = async (file) => {
  console.log(file)
  const { data: signedUrlData, error: urlError } = await supabase.storage
    .from(file.bucket_id)
    .createSignedUrl(file.file_name, 60) // 60s expiration
  if (urlError) throw urlError
  return {
    ...file,
    signed_url: signedUrlData.signedUrl,
  }
}
