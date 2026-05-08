'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import { ProjectCard } from '@/components/ProjectCard'
import { ProjectCardSkeleton } from '@/components/Skeletons'
import { FilterChips } from '@/components/FilterChips'

const CARDS_PER_ROW = 5

function fuzzyMatch(query = '', text = '') {
  if (!query) return true
  const q = query.toLowerCase()
  const t = String(text || '').toLowerCase()

  if (t.includes(q)) return true

  let qi = 0
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) qi++
  }

  return qi === q.length
}

export default function ProjectList() {
  const [projectList, setProjectList] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  // search state
  const [query, setQuery] = useState('')
  const searchInputRef = useRef(null)

  // filter state
  const [statusFilter, setStatusFilter] = useState(null)
  const [tagFilter, setTagFilter] = useState([])
  const [tagsByProject, setTagsByProject] = useState({})
  const [thumbnailsByProject, setThumbnailsByProject] = useState({})
  const [thumbnailsLoaded, setThumbnailsLoaded] = useState(false)
  const [filterPanelOpen, setFilterPanelOpen] = useState(false)

  const getProjects = async () => {
    const resp = await fetch(`/api/projects`)
    const projects = await resp.json()
    setLoading(false)
    return projects
  }

  useEffect(() => {
    getProjects().then(setProjectList)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // derive status options from project data
  const statusOptions = useMemo(() => {
    const set = new Set()
    projectList.forEach((p) => {
      if (p?.status) set.add(p.status)
    })
    return Array.from(set).sort()
  }, [projectList])

  // derive tag options once tags have been fetched
  const tagOptions = useMemo(() => {
    const set = new Set()
    Object.values(tagsByProject).forEach((tags) => {
      ;(tags || []).forEach((t) => set.add(t))
    })
    return Array.from(set).sort()
  }, [tagsByProject])

  // load tags and thumbnails for all projects in parallel
  useEffect(() => {
    if (!projectList || projectList.length === 0) {
      setTagsByProject({})
      setThumbnailsByProject({})
      setThumbnailsLoaded(false)
      return
    }

    let cancelled = false

    const loadAllMetadata = async () => {
      try {
        const projectIds = projectList.map((p) => p.id)

        const [tagsResp, thumbnailsResp] = await Promise.all([
          fetch('/api/projects/tags', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(projectIds),
          }),
          fetch('/api/projects/thumbnail', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(projectIds),
          }),
        ])

        if (cancelled) return

        // Process tags
        if (tagsResp.ok) {
          const tagsByProject = await tagsResp.json()
          if (
            typeof tagsByProject === 'object' &&
            !Array.isArray(tagsByProject)
          ) {
            setTagsByProject(tagsByProject)
          }
        }

        // Process thumbnails
        if (thumbnailsResp.ok) {
          const thumbnailsByProject = await thumbnailsResp.json()
          if (
            typeof thumbnailsByProject === 'object' &&
            !Array.isArray(thumbnailsByProject)
          ) {
            setThumbnailsByProject(thumbnailsByProject)
          }
        }
        if (!cancelled) {
          setThumbnailsLoaded(true)
        }
      } catch (e) {
        if (!cancelled) {
          setTagsByProject({})
          setThumbnailsByProject({})
          setThumbnailsLoaded(true)
        }
      }
    }

    loadAllMetadata()

    return () => {
      cancelled = true
    }
  }, [projectList])

  const rows = useMemo(() => {
    if (!projectList) return []
    const filtered = projectList.filter((project) => {
      // search: match against name, description, and status
      const matchesQuery =
        fuzzyMatch(query, project?.name) ||
        fuzzyMatch(query, project?.description) ||
        fuzzyMatch(query, project?.status)

      if (!matchesQuery) return false

      // status filter (single select)
      if (statusFilter && project?.status !== statusFilter) return false

      // tag filter (multi-select)
      if (tagFilter.length > 0) {
        const projectTags = tagsByProject[project.id] || []
        const hasMatch = projectTags.some((t) => tagFilter.includes(t))
        if (!hasMatch) return false
      }

      return true
    })

    // Sort: thumbnails first, then by name
    const sorted = filtered.sort((a, b) => {
      const aHasThumb = thumbnailsByProject[a.id] ? 1 : 0
      const bHasThumb = thumbnailsByProject[b.id] ? 1 : 0
      if (bHasThumb !== aHasThumb) return bHasThumb - aHasThumb
      return (a.name || '').localeCompare(b.name || '')
    })

    // Group non-thumbnail cards into adjacent pairs
    const result = []
    let nonThumbBuffer = []

    for (const project of sorted) {
      if (thumbnailsByProject[project.id]) {
        if (nonThumbBuffer.length > 0) {
          result.push({ type: 'pair', projects: nonThumbBuffer })
          nonThumbBuffer = []
        }
        result.push({ type: 'single', project })
      } else {
        nonThumbBuffer.push(project)
        if (nonThumbBuffer.length === 2) {
          result.push({ type: 'pair', projects: nonThumbBuffer })
          nonThumbBuffer = []
        }
      }
    }
    if (nonThumbBuffer.length > 0) {
      result.push({ type: 'pair', projects: nonThumbBuffer })
    }

    return result
  }, [
    projectList,
    query,
    statusFilter,
    tagFilter,
    tagsByProject,
    thumbnailsByProject,
  ])

  return (
    <div className="w-full h-full flex flex-col">
      <div className="grid grid-cols-1 md:grid-cols-2 items-center justify-between p-5 gap-4 sticky top-0 z-100 bg-background/80 backdrop-blur-xl">
        <div>
          <h1 className="font-bold text-lg text-primary">Projects</h1>
          <h2 className="font-light text-xs">
            these are a few of my favorite things
          </h2>
        </div>

        {/* Search input */}
        <div className="flex h-full items-center gap-3">
          <label className="search-input-wrapper flex flex-auto h-full items-center gap-2 rounded-lg border px-3 py-2 text-sm bg-background/80">
            <svg
              className="h-4 w-4 text-primary/70"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <g
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeWidth="2.0"
                fill="none"
                stroke="currentColor"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </g>
            </svg>
            <input
              type="search"
              className="grow bg-transparent placeholder:text-text/60 text-sm"
              placeholder="Search projects"
              ref={searchInputRef}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="hidden md:flex items-center gap-1 text-[10px] font-mono text-primary/80">
              <kbd className="kbd kbd-md px-2 border border-primary/40 rounded-lg bg-background/80">
                ⌘
              </kbd>
              <kbd className="kbd kbd-sm px-2 border border-primary/40 rounded-lg bg-background/80">
                K
              </kbd>
            </div>
          </label>

          {/* Filter button */}
          <button
            onClick={() => {
              setFilterPanelOpen((prev) => {
                const next = !prev
                if (!next) {
                  // clearing filters when closing the panel
                  setStatusFilter(null)
                  setTagFilter([])
                }
                return next
              })
            }}
            className={`h-full flex flex-none px-3 py-2 rounded-md border transition ${
              filterPanelOpen
                ? 'border-primary text-primary'
                : 'hover:border-primary/40 hover:text-primary'
            } items-center`}
            aria-label="Toggle filters"
            title="Toggle filters"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            >
              {filterPanelOpen ? (
                <path d="M13.013 3H2l8 9.46V19l4 2v-8.54l.9-1.055M22 3l-5 5m0-5 5 5" />
              ) : (
                <path d="M22 3H2l8 9.46V19l4 2v-8.54z" />
              )}
            </svg>
          </button>
        </div>
        {/* Filter bar - status (single select) and tags (multi select) */}
        {!loading && filterPanelOpen && (
          <div className="transition-all duration-300 ease-in-out">
            <div className="flex flex-row flex-wrap gap-4 items-start justify-start pb-4">
              <div className="">
                <FilterChips
                  label="Status"
                  options={statusOptions}
                  multiple={false}
                  selectedValues={statusFilter ? [statusFilter] : []}
                  onChange={(values) => setStatusFilter(values[0] ?? null)}
                />
              </div>
              <div className="">
                <FilterChips
                  label="Tags"
                  options={tagOptions}
                  multiple
                  selectedValues={tagFilter}
                  onChange={setTagFilter}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div
        className={`flex-1 grid content-start grid-cols-1 md:grid-cols-4 lg:grid-cols-${CARDS_PER_ROW} p-5 gap-2 md:gap-0.5 background/80`}
      >
        {loading && <ProjectCardSkeleton count={CARDS_PER_ROW * 2} />}
        {!loading &&
          rows.map((item) =>
            item.type === 'single' ? (
              <ProjectCard
                key={item.project.id}
                project={item.project}
                selected={selected}
                thumbnailUrl={thumbnailsByProject[item.project.id] || null}
                hasThumbnail={true}
              />
            ) : (
              <div
                key={item.projects.map((p) => p.id).join('-')}
                className="contents md:flex md:flex-col md:gap-0.5"
              >
                {item.projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    selected={selected}
                    thumbnailUrl={null}
                    hasThumbnail={false}
                  />
                ))}
              </div>
            ),
          )}
      </div>
    </div>
  )
}
