import { supabase } from '@/lib/db'

export async function GET() {
  const { data: projects, error } = await supabase
    .from('project')
    .select('id, name, description, status')
  if (error) {
    return new Response.json({ error: error.message, status: error.status })
  }
  return Response.json(projects)
}

export async function POST() {
  const { project_id } = params
  const { data: project, error } = await supabase
    .from('project')
    .select('id, name, description, web_link')
    .eq('id', project_id)
  if (error) {
    return new Response.json({ error: error.message, status: error.status })
  }
  return Response.json(project)
}
