'use client'
import Link from 'next/link'
import { useEffect, useState, useMemo } from 'react'

const getProjects = async () => {
  const resp = await fetch(`/api/projects`)
  const projects = await resp.json()
  return projects
}

const statusColor = {
  'in progress': '#facc15', // yellow-400
  completed: '#22c55e', // green-500
}

const statusOptions = ['all', 'canceled', 'in progress', 'completed']

export default function ProjectList() {
  const [projectList, setProjectList] = useState([])
  const [filterStatus, setFilterStatus] = useState('all')

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

  const columns = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      renderCell: (params) => (
        <Link
          href={`/${params.row.id}`}
          className="text-blue-400 hover:underline"
        >
          {params.value}
        </Link>
      ),
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 2,
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: (params) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              display: 'inline-block',
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: statusColor[params.value] || '#a3a3a3',
            }}
            aria-label={params.value}
          ></span>
          {params.value}
        </span>
      ),
    },
  ]

  return (
    <main className="flex min-h-screen w-full flex-col items-stretch p-6 gap-10 bg-background">
      <div className="mb-4 flex gap-4 items-center">
        <p className="text-accent">projects</p>
      </div>
      <div className="flex flex-col gap-8">
        {rows.map((project) => (
          <div
            key={project.id}
            className="rounded-lg bg-background p-4 flex flex-col nm-protrude nm-flat nm-light-source-t"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-semibold text-accent">
                <Link href={`/${project.id}`}>{project.name}</Link>
              </span>
              <div className="text-sm  flex items-center gap-2">
                <span>{project.status}</span>{' '}
                <span
                  className={
                    `inline-block w-3 h-3 rounded-full ` +
                    (project.status === 'in progress'
                      ? 'bg-yellow'
                      : project.status === 'completed'
                        ? 'bg-green'
                        : project.status === 'canceled'
                          ? 'bg-danger'
                          : 'bg-borderlight')
                  }
                  aria-label={project.status}
                ></span>
              </div>
            </div>
            <div className="mb-1">{project.description}</div>
          </div>
        ))}
      </div>
    </main>
  )
}
