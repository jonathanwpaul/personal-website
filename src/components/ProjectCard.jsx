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
      className={`group relative
        flex flex-row items-center gap-3 p-3 min-h-[110px]
        md:block md:p-0 md:min-h-[280px]
        overflow-hidden rounded-lg md:rounded-none border transition-colors duration-200 bg-card
        ${selected ? 'border-primary' : 'border-border hover:border-primary'}`}
    >
      {/* Forces aspect ratio on desktop via padding-bottom trick (pb-[160%] = ~4:5 portrait) */}
      <div className="hidden md:block w-full pb-[160%]" aria-hidden="true" />

      {/* Thumbnail: small fixed square on mobile, fills card on desktop */}
      <div className="shrink-0 w-20 h-20 rounded-md overflow-hidden flex items-center justify-center text-primary bg-card
                      md:absolute md:inset-0 md:w-full md:h-full md:rounded-none">
        {thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailUrl}
            alt={`${project.name} thumbnail`}
            className="w-full h-full object-cover"
          />
        ) : (
          <ThumbnailPlaceholder />
        )}
      </div>

      {/* Mobile: inline text beside thumbnail */}
      <div className="flex flex-col flex-1 gap-1 md:hidden">
        <span className="text-sm font-semibold">{project.name}</span>
        <span className="text-xs opacity-90">{project.description}</span>
      </div>

      {/* Desktop: frosted overlay — 1/3 height at rest, full on hover */}
      <div className="hidden md:flex flex-col justify-end gap-1.5 p-3
                      absolute bottom-0 left-0 right-0 overflow-hidden
                      h-1/3 group-hover:h-full
                      transition-all duration-300 ease-in-out
                      backdrop-blur-md bg-black/30">
        {/* Hover-only content — zero height when not hovered so name stays visible */}
        <div className="h-0 overflow-hidden group-hover:h-auto flex flex-col gap-1.5 shrink-0">
          <p className="text-xs text-white/90 leading-relaxed line-clamp-[8]
                        opacity-0 group-hover:opacity-100
                        transition-opacity duration-200 delay-150">
            {project.description}
          </p>
          <span className="text-[0.65rem] text-white/60 capitalize
                           opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-150">
            {project.status}
          </span>
          {projectTags.length > 0 && (
            <div className="flex flex-wrap gap-1
                            opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-150">
              {projectTags.map((tag) => (
                <span
                  key={tag}
                  className="text-[0.5rem] px-1.5 py-0.5 rounded-full border border-white/30 bg-white/10 text-white/80"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        {/* Always visible */}
        <span className="text-sm font-semibold text-white leading-tight truncate shrink-0">
          {project.name}
        </span>
      </div>
    </Link>
  )
}
