import { supabase } from '@/db'

// POST body: project id as plain text
export async function POST(req) {
  const project_id = await req.text()

  if (!project_id) {
    return Response.json({ error: 'Missing project id' }, { status: 400 })
  }

  // Assumes a join table `project_tags` with a `tag` relation having `name`
  const { data, error } = await supabase
    .from('project_tags')
    .select('tag(name)')
    .eq('project_id', project_id)
    .limit(4)

  if (error) {
    return Response.json({ error: error.message }, { status: error.status || 500 })
  }

  const tags = (data || [])
    .map((row) => row.tag?.name)
    .filter(Boolean)

  return Response.json(tags)
}
