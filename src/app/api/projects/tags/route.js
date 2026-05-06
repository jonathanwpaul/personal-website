import { supabase } from '@/db'

// POST body: single project id as plain text, or JSON array of project ids
export async function POST(req) {
  const body = await req.text()

  if (!body) {
    return Response.json({ error: 'Missing project id(s)' }, { status: 400 })
  }

  let projectIds
  try {
    const parsed = JSON.parse(body)
    projectIds = Array.isArray(parsed) ? parsed : [body]
  } catch {
    projectIds = [body]
  }

  if (projectIds.length === 0) {
    return Response.json({ error: 'Missing project id(s)' }, { status: 400 })
  }

  // Assumes a join table `project_tags` with a `tag` relation having `name`
  const { data, error } = await supabase
    .from('project_tags')
    .select('project_id, tag(name)')
    .in('project_id', projectIds)

  if (error) {
    return Response.json({ error: error.message }, { status: error.status || 500 })
  }

  // Group tags by project_id
  const tagsByProject = {}
  ;(data || []).forEach((row) => {
    const projectId = row.project_id
    const tagName = row.tag?.name
    if (!tagName) return
    if (!tagsByProject[projectId]) {
      tagsByProject[projectId] = []
    }
    if (tagsByProject[projectId].length < 4) {
      tagsByProject[projectId].push(tagName)
    }
  })

  return Response.json(tagsByProject)
}
