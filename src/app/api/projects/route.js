import { supabase } from '@/db'

export async function GET() {
  const { data: projects, error } = await supabase
    .from('project')
    .select('id, name, description, status')
  if (error) {
    return new Response.json({ error: error.message, status: error.status })
  }
  return Response.json(projects)
}

export async function POST(req) {
  const project_name = await req.text()
  const { data: project, error } = await supabase
    .from('project')
    .select('id, name, description, web_link')
    .eq('name', project_name)
  if (error) {
    return new Response.json({ error: error.message, status: error.status })
  }
  return Response.json(project)
}
