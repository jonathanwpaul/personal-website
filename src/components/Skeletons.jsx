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

export function ProfileSectionSkeleton() {
  return (
    <div className="max-w-5xl h-full mx-auto px-6 py-8 overflow-y-auto snap-y snap-proximity md:snap-none">
      <div className="flex h-full flex-col md:grid md:grid-cols-3 md:gap-12 items-stretch animate-pulse">
        {/* Profile column */}
        <section className="min-h-[calc(100vh-30px)] md:min-h-0 md:col-span-1 flex flex-col items-center gap-12 p-6 md:justify-center">
          <div className="shrink-0 flex flex-col items-center gap-6">
            <div className="w-28 h-28 rounded-full bg-gray-300/40 dark:bg-gray-600" />
            <div className="h-8 bg-gray-300/50 dark:bg-gray-600 rounded w-48" />
            <div className="flex flex-col gap-2">
              <div className="h-4 bg-gray-300/40 dark:bg-gray-600 rounded w-64" />
              <div className="h-4 bg-gray-300/40 dark:bg-gray-600 rounded w-56" />
              <div className="h-4 bg-gray-300/40 dark:bg-gray-600 rounded w-60" />
              <div className="h-4 bg-gray-300/40 dark:bg-gray-600 rounded w-52" />
            </div>
          </div>
          <div className="flex shadow-lg">
            <div className="h-10 w-36 rounded-md bg-gray-300/40 dark:bg-gray-600" />
          </div>
        </section>

        {/* About column */}
        <section className="mt-12 md:mt-0 flex flex-col gap-4 md:col-span-2 md:justify-center md:px-8 min-h-[calc(100vh-30px)] md:min-h-0">
          <div className="h-10 bg-gray-300/50 dark:bg-gray-600 rounded w-32" />
          <div className="space-y-3">
            <div className="h-4 bg-gray-300/40 dark:bg-gray-600 rounded w-full" />
            <div className="h-4 bg-gray-300/40 dark:bg-gray-600 rounded w-full" />
            <div className="h-4 bg-gray-300/40 dark:bg-gray-600 rounded w-5/6" />
            <div className="h-4 bg-gray-300/40 dark:bg-gray-600 rounded w-4/6" />
            <div className="h-4 bg-gray-300/40 dark:bg-gray-600 rounded w-full" />
            <div className="h-4 bg-gray-300/40 dark:bg-gray-600 rounded w-3/4" />
          </div>
        </section>
      </div>
    </div>
  )
}

export function ProjectPageSkeleton() {
  return (
    <div className="animate-pulse space-y-6 w-full">
      {/* Top: thumbnail left, info right on desktop; stacked on mobile */}
      <div className="flex flex-col gap-6 md:grid md:grid-cols-[1fr_2fr] md:gap-6">
        <div className="h-48 md:min-h-[300px] bg-gray-300/70 dark:bg-gray-600 rounded" />
        <div className="space-y-4">
          <div className="h-6 bg-gray-300/50 dark:bg-gray-600 rounded w-1/2" />
          <div className="h-4 bg-gray-300/40 dark:bg-gray-600 rounded w-full" />
          <div className="h-4 bg-gray-300/40 dark:bg-gray-600 rounded w-3/4" />
          <div className="h-4 bg-gray-300/50 dark:bg-gray-600 rounded w-1/3 mt-6" />
          <div className="h-8 bg-gray-300/40 dark:bg-gray-600 rounded w-full" />
          <div className="h-8 bg-gray-300/40 dark:bg-gray-600 rounded w-full" />
          <div className="h-4 bg-gray-300/50 dark:bg-gray-600 rounded w-1/3 mt-6" />
          <div className="h-4 bg-gray-300/40 dark:bg-gray-600 rounded w-full" />
          <div className="h-4 bg-gray-300/40 dark:bg-gray-600 rounded w-full" />
        </div>
      </div>

      {/* Bottom: full-width content */}
      <div className="md:border-t md:border-border md:pt-8 space-y-4">
        <div className="h-4 bg-gray-300/50 dark:bg-gray-600 rounded w-1/4" />
        <div className="h-4 bg-gray-300/40 dark:bg-gray-600 rounded w-full" />
        <div className="h-4 bg-gray-300/40 dark:bg-gray-600 rounded w-full" />
        <div className="h-4 bg-gray-300/40 dark:bg-gray-600 rounded w-3/4" />
        <div className="h-4 bg-gray-300/40 dark:bg-gray-600 rounded w-full" />
        <div className="h-64 bg-gray-300/70 dark:bg-gray-600 rounded" />
      </div>
    </div>
  )
}
