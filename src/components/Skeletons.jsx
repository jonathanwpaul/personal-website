import React from 'react'

export function ProjectCardSkeleton({ count = 6 }) {
  return Array.from({ length: count }).map((_, i) => (
    <div key={i} className="animate-pulse rounded-lg border bg-white/5 p-4">
      <div className="h-44 w-full rounded-md bg-gray-300/70 dark:bg-gray-600 mb-4" />
      <div className="h-4 bg-gray-300/70 dark:bg-gray-600 rounded w-3/4 mb-2" />
      <div className="h-3 bg-gray-300/60 dark:bg-gray-600 rounded w-1/2" />
    </div>
  ))
}

export function ProjectPageSkeleton() {
  return (
    <div className="space-y-6 w-full">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-300/70 dark:bg-gray-600 rounded w-1/3 mb-4" />
        <div className="h-6 bg-gray-300/60 dark:bg-gray-600 rounded w-2/3" />
      </div>

      <div className="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 bg-gray-300/70 dark:bg-gray-600 rounded" />
        <div className="space-y-4">
          <div className="h-4 bg-gray-300/70 dark:bg-gray-600 rounded w-full" />
          <div className="h-4 bg-gray-300/60 dark:bg-gray-600 rounded w-5/6" />
          <div className="h-4 bg-gray-300/60 dark:bg-gray-600 rounded w-4/6" />
          <div className="h-4 bg-gray-300/60 dark:bg-gray-600 rounded w-2/3" />
        </div>
      </div>

      <div className="animate-pulse">
        <div className="h-40 bg-gray-300/70 dark:bg-gray-600 rounded" />
      </div>
    </div>
  )
}
