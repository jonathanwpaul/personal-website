export const ProjectButton = ({ project, handleSelect, selected }) => (
  <button
    key={project.id}
    onClick={() => handleSelect(project)}
    className={
      'text-left rounded-lg p-4 border transition' +
      (selected?.id === project.id
        ? 'border-text bg-primary/25'
        : 'border-primary/100 hover:border-primary/60')
    }
  >
    <div className="flex items-center justify-between mb-1">
      <span className="text-md font-semibold text-primary">{project.name}</span>
      <span className="text-xs opacity-80">{project.status}</span>
    </div>
    <div className="text-sm opacity-90">{project.description}</div>
  </button>
)
