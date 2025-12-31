'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ThumbnailPlaceholder } from './ThumbnailPlaceholder'

export const ProjectCard = ({ project, selected }) => {
  const [thumbnailUrl, setThumbnailUrl] = useState(null)

  useEffect(() => {
    if (!project?.id) return

    let cancelled = false

    const loadThumbnail = async () => {
      try {
        const resp = await fetch('/api/projects/thumbnail', {
          method: 'POST',
          body: String(project.id),
        })

        if (!resp.ok) return

        const url = await resp.text()
        if (!cancelled && url) {
          setThumbnailUrl(url)
        }
      } catch (e) {
        // fail silently and keep placeholder
      }
    }

    loadThumbnail()

    return () => {
      cancelled = true
    }
  }, [project?.id])

  return (
    <Link
      href={`/projects/${project.name}`}
      className={
        'min-h-[400px] flex flex-col text-left p-4 content-end rounded-lg overflow-hidden border transition hover:border-primary'
      }
    >
      <div className="mb-5 rounded-lg flex flex-[1_0_0] bg-primary/20 justify-center items-center text-primary overflow-hidden">
        {thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailUrl}
            alt={`${project.name} thumbnail`}
            className="h-full w-full object-cover"
          />
        ) : (
          <ThumbnailPlaceholder />
        )}
      </div>
      <div className="flex flex-3 flex-col gap-2 items-left bg-background/80 backdrop-blur">
        <span className="text-md font-semibold">{project.name}</span>
        <span className="text-sm opacity-90">{project.description}</span>
        <span className="text-xs opacity-80 text-secondary">{project.status}</span>
      </div>
    </Link>
  )
}
