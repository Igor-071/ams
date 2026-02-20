import { SearchInput } from '@/components/shared/search-input.tsx'
import { Button } from '@/components/ui/button.tsx'
import { cn } from '@/lib/utils.ts'
import type { ServiceType } from '@/types/service.ts'

type TypeFilterValue = 'all' | ServiceType

const typeOptions: { value: TypeFilterValue; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'api', label: 'API' },
  { value: 'docker', label: 'Docker' },
]

interface ServiceFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  typeFilter: TypeFilterValue
  onTypeFilterChange: (value: TypeFilterValue) => void
}

export function ServiceFilters({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
}: ServiceFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <SearchInput
        value={search}
        onChange={onSearchChange}
        placeholder="Search services..."
        className="flex-1"
      />
      <div className="flex gap-1 rounded-full border border-white/[0.06] p-1" role="group" aria-label="Filter by type">
        {typeOptions.map((opt) => (
          <Button
            key={opt.value}
            variant="ghost"
            size="sm"
            onClick={() => onTypeFilterChange(opt.value)}
            className={cn(
              'h-7 rounded-full px-3 text-xs',
              typeFilter === opt.value
                ? 'bg-white/10 text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {opt.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
