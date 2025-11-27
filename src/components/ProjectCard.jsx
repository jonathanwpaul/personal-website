import Link from 'next/link'
import { ThumbnailPlaceholder } from './ThumbnailPlaceholder'

export const ProjectCard = ({ project, selected }) => (
  <Link
    href={`/projects/${project.name}`}
    className={
      'min-h-[400px] flex flex-col text-left p-4 content-end rounded-lg overflow-hidden border transition hover:border-primary ' +
      (selected?.id === project.id
        ? 'border-text bg-primary/10'
        : 'border-text/50')
    }
  >
    <div className="mb-5 rounded-lg flex flex-[1_0_0] bg-primary/20 justify-center items-center text-primary">
      <ThumbnailPlaceholder />
    </div>
    <div className="flex flex-3 flex-col gap-2 items-left bg-background/80 backdrop-blur">
      <span className="text-md font-semibold">{project.name}</span>
      <span className="text-sm opacity-90">{project.description}</span>
      <span className="text-xs opacity-80 text-secondary">
        {project.status}
      </span>
    </div>
  </Link>
)
