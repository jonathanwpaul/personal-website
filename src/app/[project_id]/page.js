import { supabase } from '@/lib/db'
import { ImageCarousel, EmbedCarousel } from './carousel'
import Title from './title'

const getProject = async (id) => {
  const { data, error } = await supabase
    .from('project')
    .select(
      'id, name, description, bom, web_link, project_files(*), project_videos(id, video_embed_link)',
    )
    .eq('id', id)

  if (error) throw new Error(error.message)
  return data[0] || {}
}

export default async function Details({ params }) {
  const paramResult = await params
  console.log('paramResult', paramResult)
  if (!paramResult.project_id) return <p>Nothing to see here :(</p>

  const project = await getProject(paramResult.project_id)

  console.log(project)
  const { name, description, bom, web_link, project_files, project_videos } =
    project

  return (
    <div className="min-h-screen w-full flex flex-col items-center gap-8 p-8 bg-gray-100 dark:bg-gray-900">
      <Title titleText={name} />
      <div className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-md dark:bg-gray-800">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Description
        </h2>
        <p className="mb-4 text-gray-700 dark:text-gray-300">{description}</p>
        {bom && (
          <>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              Bill of Materials
            </h2>
            <ul className="list-disc list-inside mb-4 text-gray-700 dark:text-gray-300">
              {bom.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </>
        )}
        {web_link && (
          <p className="text-blue-500 dark:text-blue-300">
            <a href={web_link} target="_blank" rel="noopener noreferrer">
              {web_link}
            </a>
          </p>
        )}
        {project_videos.length > 0 && (
          <div className="mb-4">
            <h2 className="text-2xl font-bold mb-4">{`Video${
              project_videos.length > 1 ? 's' : ''
            }`}</h2>
            <EmbedCarousel
              list={project_videos.map((e) => e.video_embed_link)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
