import React from 'react'
import { ProjectPageSkeleton } from '../../components/Skeletons'

export default function Loading() {
  return (
    <div className="px-6 py-8">
      <ProjectPageSkeleton />
    </div>
  )
}
