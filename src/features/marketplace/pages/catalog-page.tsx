import { useState, useMemo } from 'react'
import { useDebounce } from '@/hooks/use-debounce.ts'
import { mockServices } from '@/mocks/data/services.ts'
import { DEBOUNCE_MS } from '@/lib/constants.ts'
import { ServiceFilters } from '../components/service-filters.tsx'
import { ServiceGrid } from '../components/service-grid.tsx'
import type { ServiceType } from '@/types/service.ts'

export function CatalogPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | ServiceType>('all')

  const debouncedSearch = useDebounce(search, DEBOUNCE_MS)

  const filteredServices = useMemo(() => {
    let services = mockServices.filter((s) => s.status === 'active')

    if (typeFilter !== 'all') {
      services = services.filter((s) => s.type === typeFilter)
    }

    if (debouncedSearch) {
      const lower = debouncedSearch.toLowerCase()
      services = services.filter(
        (s) =>
          s.name.toLowerCase().includes(lower) ||
          s.description.toLowerCase().includes(lower) ||
          s.merchantName.toLowerCase().includes(lower),
      )
    }

    return services
  }, [debouncedSearch, typeFilter])

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
