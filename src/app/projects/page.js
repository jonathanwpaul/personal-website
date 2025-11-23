'use client'
import { useEffect, useMemo, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { ProjectButton } from '@/components/ProjectButton'
import { ProjectListSkeleton } from '@/components/Skeletons'

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

const gridStyling = 'grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3'

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

  const getProjects = async () => {
    const resp = await fetch(`/api/projects`)
    const projects = await resp.json()
    setLoading(false)
    return projects
  }

  useEffect(() => {
    getProjects().then(setProjectList)
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

  const availableFilterOptions = useMemo(() => {
    if (!filterField) return []
    const opts = new Set()
    projectList.forEach((p) => {
      const val = p?.[filterField]
      if (Array.isArray(val)) val.forEach((v) => opts.add(String(v)))
      else if (val != null) opts.add(String(val))
    })
    return Array.from(opts)
  }, [filterField, projectList])

  // filtered rows using search and filter
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
    <div className="flex flex-col gap-5 mt-16 m-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-bold text-lg text-primary">Projects</h1>
          <h2 className="font-light">these are a few of my favorite things</h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Search input */}
          <div className="relative">
            <input
              aria-label="Search projects"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects by name..."
              className="px-3 py-2 rounded-md border bg-white/5 border-primary/20 focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-1 top-1 text-sm px-2"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter button group */}
          <div className="relative">
            <button
              onClick={() => setFilterPanelOpen((s) => !s)}
              className="px-3 py-2 rounded-md border bg-white/5 border-primary/20"
            >
              Filter
            </button>

            {filterPanelOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white/5 border border-primary/20 rounded shadow-md p-3 z-20">
                <div className="mb-2">
                  <div className="text-sm mb-1">Filter field</div>
                  <select
                    value={filterField || ''}
                    onChange={(e) => {
                      const val = e.target.value || null
                      setFilterField(val)
                      setFilterOptions([])
                    }}
                    className="w-full rounded px-2 py-1 bg-transparent border border-primary/10"
                  >
                    <option value="">(none)</option>
                    {availableFilterFields.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>

                {filterField && (
                  <div>
                    <div className="text-sm mb-1">
                      Options (select to filter)
                    </div>
                    <div className="max-h-40 overflow-auto border-t border-primary/10 pt-2">
                      {availableFilterOptions.length === 0 && (
                        <div className="text-xs opacity-70">No options</div>
                      )}
                      {availableFilterOptions.map((opt) => (
                        <label
                          key={opt}
                          className="flex items-center gap-2 text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={filterOptions.includes(opt)}
                            onChange={() => toggleFilterOption(opt)}
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {loading && <ProjectListSkeleton gridStyling={gridStyling} count={12} />}
      {!loading && (
        <div
          className={`min-h-0 ${gridStyling} overflow-y-auto border-r-2 border-primary/20`}
        >
          {rows.map((project) => (
            <ProjectButton project={project} selected={selected} />
          ))}
        </div>
      )}
    </div>
  )
}
