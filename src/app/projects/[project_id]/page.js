'use client'
import { useCallback, useEffect, useState } from 'react'
import { ImageCarousel, EmbedCarousel } from './carousel'
import Title from '@/components/Title'
import dynamic from 'next/dynamic'

const ThreeViewer = dynamic(() => import('@/components/ThreeViewer'), {
  ssr: false,
})

export default function Details({ params }) {
  if (!params.project_id) return <p>Nothing to see here :(</p>

  const [project, setProject] = useState({})
  const [modelUrl, setModelUrl] = useState({})

  useEffect(() => {
    getProject(params.project_id)
    getModelUrl(params.project_id)
  }, [])

  const getProject = useCallback(async (project_id) => {
    const resp = await fetch('/api/projects', {
      method: 'POST',
      body: project_id,
    })
    const project = await resp.json()
    console.log(project)
    setProject(project)
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

  return (
    <div className="min-h-screen w-full flex flex-col items-center gap-8 p-8">
      <Title titleText={name} />
      <div className="w-full max-w-4xl p-6 rounded-lg ">
        <h2 className="text-2xl font-bold mb-4">Description</h2>
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
        {modelUrl && (
          <div className="flex w-full items-center justify-center rounded-lg mt-12 m-4 border border-primary/30 bg-background/80 text-sm opacity-80">
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
      </div>
    </div>
  )
}
