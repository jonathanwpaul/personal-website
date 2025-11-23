'use client'
import { useEffect, useMemo, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { ProjectButton } from '@/components/ProjectButton'
import Loading from './loading'

const ThreeViewer = dynamic(() => import('@/components/ThreeViewer'), {
  ssr: false,
})

export default function ProjectList() {
  const [projectList, setProjectList] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [modelUrl, setModelUrl] = useState(null)

  const getProjects = async () => {
    const resp = await fetch(`/api/projects`)
    const projects = await resp.json()
    setLoading(false)
    return projects
  }

  useEffect(() => {
    getProjects().then(setProjectList)
  }, [])

  const rows = useMemo(() => projectList)

  const handleSelect = useCallback(async (project) => {
    setSelected(project)
    setModelUrl(null)
    const resp = await fetch('/api/projects/files', {
      method: 'POST',
      body: project.id,
    })
    const url = await resp.text()
    setModelUrl(url)
  }, [])

  const divStyle =
    'flex w-full items-center justify-center rounded-lg mt-12 m-4 border border-primary/30 bg-background/80 text-sm opacity-80'

  return (
    <div className="flex gap-5 h-full">
      <div className="p-5 lg:col-span-1 min-h-0 flex flex-col gap-3 overflow-y-auto border-r-2 border-primary/20 first:mt-7">
        {loading && <Loading />}
        {!loading &&
          rows.map((project) => (
            <ProjectButton
              key={project.id}
              project={project}
              handleSelect={handleSelect}
              selected={selected}
            />
          ))}
      </div>

      <div className={divStyle}>
        {/* Right pane: 3D viewer, fills remaining height, no page scroll */}
        {selected ? (
          modelUrl ? (
            <ThreeViewer
              modelUrl={modelUrl}
              autoPlay={true}
              resumeDelayMs={5000}
              minDistance={0.1}
              maxDistance={1}
            />
          ) : (
            'No 3D model found for this project.'
          )
        ) : (
          'Select a project to preview its 3D animation.'
        )}
      </div>
    </div>
  )
}
