'use client'
import { useEffect, useMemo, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'

const ThreeViewer = dynamic(() => import('@/components/ThreeViewer'), {
  ssr: false,
})

const getProjects = async () => {
  const resp = await fetch(`/api/projects`)
  const projects = await resp.json()
  return projects
}

export default function ProjectList() {
  const [projectList, setProjectList] = useState([])
  const [filterStatus, setFilterStatus] = useState('all')
  const [selected, setSelected] = useState(null)
  const [modelUrl, setModelUrl] = useState(null)

  useEffect(() => {
    getProjects().then(setProjectList)
  }, [])

  const rows = useMemo(
    () =>
      filterStatus === 'all'
        ? projectList
        : projectList.filter((p) => p.status === filterStatus),
    [projectList, filterStatus],
  )

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

  return (
    <main className="min-h-screen w-full p-6 bg-background">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-accent">projects</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Left pane: project list */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {rows.map((project) => (
            <button
              key={project.id}
              onClick={() => handleSelect(project)}
              className={
                'text-left rounded-lg p-4 border transition ' +
                (selected?.id === project.id
                  ? 'border-secondary bg-background/80'
                  : 'border-secondary/30 hover:border-secondary/60')
              }
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-lg font-semibold text-accent">
                  {project.name}
                </span>
                <span className="text-xs opacity-80">{project.status}</span>
              </div>
              <div className="text-sm opacity-90">{project.description}</div>
            </button>
          ))}
        </div>

        {/* Right pane: 3D viewer, shows only when a project is selected */}
        <div className="lg:col-span-3">
          {selected ? (
            modelUrl ? (
              <ThreeViewer
                modelUrl={modelUrl}
                autoPlay={true}
                resumeDelayMs={5000}
                minDistance={0.8}
                maxDistance={8}
              />
            ) : (
              <div className="flex h-[50vh] lg:h-[70vh] items-center justify-center rounded border border-secondary/30 text-sm opacity-80">
                No 3D model found for this project.
              </div>
            )
          ) : (
            <div className="flex h-[30vh] items-center justify-center rounded border border-secondary/30 text-sm opacity-80">
              Select a project to preview its 3D animation.
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
