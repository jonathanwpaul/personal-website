import React from 'react'
import { ProjectListSkeleton } from '../../components/Skeletons'

export default function Loading() {
  return (
    <div className="px-6 py-8">
      <h2 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-gray-100">Loading projects…</h2>
      <ProjectListSkeleton />
    </div>
  )
}
