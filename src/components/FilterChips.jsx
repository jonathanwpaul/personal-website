'use client'

export function FilterChips({
  label,
  options = [],
  selectedValues = [],
  multiple = false,
  onChange,
}) {
  const handleToggle = (value) => {
    if (!onChange) return

    if (multiple) {
      if (selectedValues.includes(value)) {
        onChange(selectedValues.filter((v) => v !== value))
      } else {
        onChange([...selectedValues, value])
      }
    } else {
      if (selectedValues[0] === value) {
        onChange([])
      } else {
        onChange([value])
      }
    }
  }

  if (!options || options.length === 0) return null

  return (
    <div className="flex flex-col gap-2 min-w-0">
      {label && (
        <div className="text-sm font-semibold capitalize text-foreground/80">
          {label}
        </div>
      )}
      <div className="flex flex-col gap-2 overflow-x-auto pb-1 -mx-1 px-1 items-start">
        {options.map((opt) => {
          const isSelected = selectedValues.includes(opt)
          return (
            <label
              key={opt}
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs md:text-sm cursor-pointer transition whitespace-nowrap ${
                isSelected
                  ? 'bg-primary text-background border-primary'
                  : 'bg-background/80 text-foreground border-border hover:border-primary/60'
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={isSelected}
                onChange={() => handleToggle(opt)}
              />
              <span>{opt}</span>
            </label>
          )
        })}
      </div>
    </div>
  )
}
