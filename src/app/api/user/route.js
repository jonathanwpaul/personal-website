import { supabase } from '@/db'
import { getSignedUrl } from '@/utils'

export async function POST() {
  const getProfilePicture = async () => {
    try {
      const { data, error } = await supabase.rpc('get_profile_picture')
      if (error || !Array.isArray(data)) return undefined
      const withSignedUrl = await getSignedUrl(data[0])
      return withSignedUrl.signed_url
    } catch (e) {
      return undefined
    }
  }

  const [userResult, handlesResult, profilePicUrl] = await Promise.all([
    supabase.from('user').select('*'),
    supabase.from('socials').select('*'),
    getProfilePicture(),
  ])

  if (userResult.error) {
    return new Response(null, { statusText: 'unable to load user: ' + userResult.error })
  }

  if (handlesResult.error) {
    return new Response(null, {
      statusText: 'unable to load handles: ' + handlesResult.error,
    })
  }

  const user = userResult.data[0]
  user.handles = handlesResult.data
  user.profilePictureUrl = profilePicUrl

  console.log(user)

  return Response.json(user)
}
