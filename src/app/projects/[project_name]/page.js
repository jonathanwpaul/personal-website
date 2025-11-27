'use client'
import { useCallback, useEffect, useState } from 'react'
import { EmbedCarousel } from './carousel'
import { ProjectPageSkeleton } from '@/components/Skeletons'
import { ThreeViewer } from '@/components/ThreeViewer'

export default function Details({ params }) {
  const [project, setProject] = useState({})
  const [modelUrl, setModelUrl] = useState()
  const [loading, setLoading] = useState(true)
  const [animationLoading, setAnimationLoading] = useState(true)

  useEffect(() => {
    getProject(params.project_name)
    setLoading(false)
  }, [params])

  useEffect(() => {
    if (!project || !project.id) return
    getModelUrl(project?.id)
    setAnimationLoading(false)
  }, [project])

  const getProject = useCallback(async (project_name) => {
    const resp = await fetch('/api/projects', {
      method: 'POST',
      body: project_name,
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

  if (loading) return <ProjectPageSkeleton />
  if (!project) return

  const { name, description, bom, web_link, project_files, project_videos } =
    project

  return (
    <div className="mt-8 overflow-y-auto h-full w-full place-self-center max-w-4xl flex flex-col items-center gap-8 p-8">
      {modelUrl && (
        <div className="w-full items-center justify-center rounded-lg border border-primary/30 bg-background/80 text-sm opacity-80">
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
