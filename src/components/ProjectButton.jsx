export const ProjectButton = ({ project, handleSelect, selected }) => (
  <button
    key={project.id}
    onClick={() => handleSelect(project)}
    className={
      'text-left rounded-lg p-4 border transition hover:border-primary ' +
      (selected?.id === project.id
        ? 'border-primary bg-primary/10'
        : 'border-primary/50')
    }
  >
    <div className="flex flex-col gap-2 items-left">
      <span className="text-md font-semibold text-primary">{project.name}</span>
      <span className="text-sm opacity-90 text-text">
        {project.description}
      </span>

      <span className="text-xs opacity-80 text-secondary">
        {project.status}
      </span>
    </div>
  </button>
)
