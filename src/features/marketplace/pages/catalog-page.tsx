import { useState } from 'react'
import { useDebounce } from '@/hooks/use-debounce.ts'
import { getActiveServices } from '@/mocks/handlers.ts'
import { DEBOUNCE_MS } from '@/lib/constants.ts'
import { ServiceFilters } from '../components/service-filters.tsx'
import { ServiceGrid } from '../components/service-grid.tsx'
import type { ServiceType } from '@/types/service.ts'

export function CatalogPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | ServiceType>('all')

  const debouncedSearch = useDebounce(search, DEBOUNCE_MS)

  const { data: filteredServices } = getActiveServices({
    search: debouncedSearch || undefined,
    type: typeFilter === 'all' ? undefined : typeFilter,
  })

  function clearFilters() {
    setSearch('')
    setTypeFilter('all')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-light tracking-tight text-foreground">
          Marketplace
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Discover and connect to APIs and services
        </p>
      </div>

      <ServiceFilters
        search={search}
        onSearchChange={setSearch}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
      />

      <ServiceGrid services={filteredServices} onClearFilters={clearFilters} />
    </div>
  )
}
