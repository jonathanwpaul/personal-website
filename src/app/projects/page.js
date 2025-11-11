'use client'
import { useEffect, useMemo, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { ProjectButton } from '@/components/ProjectButton'

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
    <div className="flex p-5 gap-5 h-[95%]">
      <div className="lg:col-span-2 overflow-y-auto pr-3 flex flex-col gap-4">
        {rows.map((project) => (
          <ProjectButton
            project={project}
            handleSelect={handleSelect}
            selected={selected}
          />
        ))}
      </div>

      {/* Right pane: 3D viewer, fills remaining height, no page scroll */}
      {selected ? (
        modelUrl ? (
          <ThreeViewer
            modelUrl={modelUrl}
            autoPlay={true}
            resumeDelayMs={5000}
            minDistance={0.1}
            maxDistance={1}
            className="h-full"
          />
        ) : (
          <div className="flex h-full items-center justify-center rounded-lg p-4 border border-secondary/30 bg-background/80 text-sm opacity-80">
            No 3D model found for this project.
          </div>
        )
      ) : (
        <div className="flex h-full items-center justify-center rounded-lg p-4 border border-secondary/30 bg-background/80 text-sm opacity-80">
          Select a project to preview its 3D animation.
        </div>
      )}
    </div>
  )
}
