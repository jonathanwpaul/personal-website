import React from 'react'

export function ProjectCardSkeleton({ count = 6 }) {
  return Array.from({ length: count }).map((_, i) => (
    <div key={i} className="animate-pulse rounded-lg border bg-white/5 overflow-hidden
                            flex flex-row items-center gap-3 p-3 min-h-[110px]
                            md:block md:p-0 md:min-h-0 md:aspect-square md:relative">
      {/* Mobile: small thumbnail placeholder on left */}
      <div className="shrink-0 w-20 h-20 rounded-md bg-gray-300/40 dark:bg-gray-600 md:hidden" />
      {/* Mobile: text lines */}
      <div className="flex flex-col flex-1 gap-2 md:hidden">
        <div className="h-3.5 bg-gray-300/50 dark:bg-gray-600 rounded w-3/4" />
        <div className="h-2.5 bg-gray-300/40 dark:bg-gray-600/70 rounded w-full" />
        <div className="h-2.5 bg-gray-300/40 dark:bg-gray-600/70 rounded w-2/3" />
      </div>
      {/* Desktop: aspect ratio spacer + full card fill */}
      <div className="hidden md:block w-full pb-[160%]" aria-hidden="true" />
      <div className="hidden md:block absolute inset-0 bg-gray-300/20 dark:bg-gray-700/40" />
      <div className="hidden md:flex absolute bottom-0 left-0 right-0 h-1/3 bg-gray-300/40 dark:bg-gray-600/60 p-3 flex-col justify-end gap-1.5">
        <div className="h-3.5 bg-gray-300/70 dark:bg-gray-500 rounded w-3/4" />
        <div className="h-2.5 bg-gray-300/50 dark:bg-gray-500/70 rounded w-1/3" />
      </div>
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
