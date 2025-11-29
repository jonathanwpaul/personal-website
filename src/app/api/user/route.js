import { supabase } from '@/db'
import { getSignedUrl } from '@/utils'

export async function POST() {
  const getProfilePicture = async () => {
    const { data, error } = await supabase.rpc('get_profile_picture')

    if (!error && Array.isArray(data)) {
      const withSignedUrl = await getSignedUrl(data[0])
      return withSignedUrl.signed_url
    }
  }

  const { data, error } = await supabase.from('user').select('*')
  if (error) {
    return new Response(null, { statusText: 'unable to load user: ' + error })
  }

  const user = data[0]

  const { data: handles, error: handlesError } = await supabase
    .from('socials')
    .select('*')

  if (handlesError) {
    return new Response(null, {
      statusText: 'unable to load handles: ' + socialError,
    })
  }

  user.handles = handles
  user.profilePictureUrl = getProfilePicture()

  return Response.json(user)
}
