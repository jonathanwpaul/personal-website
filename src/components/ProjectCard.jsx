'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ThumbnailPlaceholder } from './ThumbnailPlaceholder'

export const ProjectCard = ({ project, selected }) => {
  const [thumbnailUrl, setThumbnailUrl] = useState(null)
  const [projectTags, setProjectTags] = useState([])

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

    const loadTags = async () => {
      try {
        const resp = await fetch('/api/projects/tags', {
          method: 'POST',
          body: String(project.id),
        })

        if (!resp.ok) return

        const tags = await resp.json()
        if (!cancelled && Array.isArray(tags)) {
          setProjectTags(tags)
        }
      } catch (e) {
        // ignore, tags are optional
      }
    }

    loadTags()

    return () => {
      cancelled = true
    }
  }, [project?.id])

  return (
    <Link
      href={`/projects/${project.name}`}
      className={
        'min-h-[110px] md:min-h-[350px] flex flex-row md:flex-col items-center text-left p-4 content-end rounded-lg overflow-hidden border border-border transition hover:border-primary bg-card'
      }
    >
      <div className="mr-4 md:mr-0 mb-0 md:mb-5 rounded-lg shrink-0 w-24 h-24 md:w-[100%] md:h-auto flex md:flex-1 bg-card justify-center items-center text-primary overflow-hidden">
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
      <div className="flex flex-1 flex-col justify-center gap-1 md:gap-2 md:w-full items-start backdrop-blur-sm">
        <span className="text-md font-semibold">{project.name}</span>
        <span className="text-sm opacity-90">{project.description}</span>
        <span className="hidden md:block text-xs opacity-80 text-secondary">
          {project.status}
        </span>
        {projectTags && projectTags.length > 0 && (
          <div className="hidden md:flex mt-1 flex-wrap gap-1 text-[10px]">
            {projectTags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full border border-primary/30 bg-background/80 text-primary/80"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
