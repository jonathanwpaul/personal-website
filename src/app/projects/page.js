'use client'
 
import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import { ProjectCard } from '@/components/ProjectCard'
import { ProjectCardSkeleton } from '@/components/Skeletons'

const CARDS_PER_ROW = 5

function fuzzyMatch(query = '', text = '') {
  if (!query) return true
  const q = query.toLowerCase()
  const t = String(text || '').toLowerCase()
  // quick substring match
  if (t.includes(q)) return true
  // subsequence fuzzy match: all chars in q appear in order in t
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

  // search & filter state
  const [query, setQuery] = useState('')
  const [searchFields, setSearchFields] = useState(['name']) // default search fields; easy to expand

  const [filterField, setFilterField] = useState(null) // e.g. 'tags'
  const [filterOptions, setFilterOptions] = useState([]) // selected options
  const [filterPanelOpen, setFilterPanelOpen] = useState(false)

  const searchInputRef = useRef(null)

  const getProjects = async () => {
    const resp = await fetch(`/api/projects`)
    const projects = await resp.json()
    setLoading(false)
    return projects
  }

  useEffect(() => {
    getProjects().then(setProjectList)
  }, [])

  // Bind Ctrl+K (or Cmd+K on Mac) to focus search input
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

  // derive available filter fields from project data (simple heuristic)
  const availableFilterFields = useMemo(() => {
    if (!projectList || projectList.length === 0) return []
    const commonFields = new Set()
    projectList.forEach((p) =>
      Object.keys(p || {}).forEach((k) => commonFields.add(k)),
    )
    // prefer tags, categories, status, etc. Keep only non-object primitive or array fields
    return Array.from(commonFields).filter(
      (f) => f !== 'id' && f !== 'name' && f !== 'description',
    )
  }, [projectList])

  const fieldOptionsMap = useMemo(() => {
    const map = {}
    availableFilterFields.forEach((field) => {
      const opts = new Set()
      projectList.forEach((p) => {
        const val = p?.[field]
        if (Array.isArray(val)) val.forEach((v) => opts.add(String(v)))
        else if (val != null) opts.add(String(val))
      })
      map[field] = Array.from(opts).sort()
    })
    return map
  }, [availableFilterFields, projectList])

  const rows = useMemo(() => {
    if (!projectList) return []
    return projectList.filter((project) => {
      // search: check any of the searchFields
      const matchesQuery = searchFields.some((field) => {
        const value = project?.[field]
        if (Array.isArray(value)) return value.some((v) => fuzzyMatch(query, v))
        return fuzzyMatch(query, value)
      })

      if (!matchesQuery) return false

      // filters
      if (filterField && filterOptions.length > 0) {
        const val = project?.[filterField]
        if (Array.isArray(val)) {
          // match if any of project's values are in selected options
          return val.some((v) => filterOptions.includes(String(v)))
        }
        if (val == null) return false
        return filterOptions.includes(String(val))
      }
      return true
    })
  }, [projectList, query, searchFields, filterField, filterOptions])

  const toggleFilterOption = (opt) => {
    setFilterOptions((prev) =>
      prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt],
    )
  }

  return (
    <div className="h-full flex flex-col gap-16 px-5 pt-16 pb-5 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 items-center justify-between gap-4">
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
              if (filterPanelOpen) setFilterOptions([])
              setFilterPanelOpen((s) => !s)
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
      </div>

      {/* Filter bar - horizontal list of available filters */}
      {!loading && availableFilterFields.length > 0 && filterPanelOpen && (
        <div className="transition-all duration-800 ease-in-out">
          <div className="flex flex-wrap gap-4 items-start pb-4">
            {availableFilterFields.map((field) => {
              const isActive = filterField === field
              const fieldOptions = fieldOptionsMap[field] || []

              return (
                <div key={field} className="flex flex-col gap-2">
                  <div className="text-sm font-semibold capitalize">
                    {field}
                  </div>
                  <form className="filter flex gap-1 h-1/4">
                    <input
                      onClick={() => setFilterOptions([])}
                      className="btn btn-square min-h-[unset] h-full"
                      type="reset"
                      value="×"
                    />
                    {fieldOptions.map((opt) => (
                      <input
                        type="checkbox"
                        key={opt}
                        onClick={() => {
                          if (filterField !== field) {
                            setFilterField(field)
                            setFilterOptions([opt])
                          } else {
                            toggleFilterOption(opt)
                          }
                        }}
                        name="tags"
                        className={`btn min-h-[unset] h-full px-3 py-1 rounded-full text-sm border transition ${
                          isActive && filterOptions.includes(opt)
                            ? 'bg-primary/40 border-primary'
                            : 'bg-white/5 border-primary/20 hover:border-primary/40'
                        }`}
                        aria-label={opt}
                      />
                    ))}
                  </form>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div
        className={`overflow-y-auto grid grid-cols-1 md:grid-cols-4 lg:grid-cols-${CARDS_PER_ROW} gap-3 p-6 border border-primary/20 rounded-lg shadow-inner bg-background/80`}
      >
        {loading && <ProjectCardSkeleton count={CARDS_PER_ROW * 2} />}
        {!loading &&
          rows.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              selected={selected}
            />
          ))}
      </div>
    </div>
  )
}
