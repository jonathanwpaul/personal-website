'use client'
import { useCallback, useEffect, useState } from 'react'
import { ImageCarousel, EmbedCarousel } from './carousel'
import dynamic from 'next/dynamic'
import { ProjectPageSkeleton } from '@/components/Skeletons'
import { ThreeViewer } from '@/components/ThreeViewer'

export default function Details({ params }) {
  if (!params.project_id) return <p>Nothing to see here :(</p>

  const [project, setProject] = useState({})
  const [modelUrl, setModelUrl] = useState({})
  const [loading, setLoading] = useState(true)

  console.log(project)

  useEffect(() => {
    const getData = async () => {
      await getProject(params.project_id)
      await getModelUrl(params.project_id)
      setLoading(false)
    }
    getData()
  }, [params])

  const getProject = useCallback(async (project_id) => {
    const resp = await fetch('/api/projects', {
      method: 'POST',
      body: project_id,
    })
    const response = await resp.json()
    setProject(response[0])
  }, [])

  const getModelUrl = useCallback(async (project_id) => {
    const resp = await fetch('/api/projects/files', {
      method: 'POST',
      body: project_id,
    })
    const url = await resp.text()
    setModelUrl(url)
  }, [])

  const { name, description, bom, web_link, project_files, project_videos } =
    project

  if (loading) {
    return <ProjectPageSkeleton />
  }

  return (
    <div className="mt-8 overflow-y-auto h-full w-full place-self-center max-w-4xl flex flex-col items-center gap-8 p-8">
      {modelUrl && (
        <div className="w-full items-center justify-center rounded-lg border border-primary/30 bg-background/80 text-sm opacity-80">
          {/* Right pane: 3D viewer, fills remaining height, no page scroll */}
          <ThreeViewer
            modelUrl={modelUrl}
            autoPlay={true}
            resumeDelayMs={5000}
            minDistance={0.1}
            maxDistance={1}
          />
        </div>
      )}
      <h1 className="w-full text-primary text-2xl text-left font-bold">
        {name}
      </h1>
      <div className="w-full ">
        <h2 className="text-xl font-bold mb-4">Description</h2>
        <p className="mb-4">{description}</p>
        {bom && (
          <>
            <h2 className="text-2xl font-bold mb-4">Bill of Materials</h2>
            <ul className="list-disc list-inside mb-4">
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
        {project_videos && project_videos.length > 0 && (
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
