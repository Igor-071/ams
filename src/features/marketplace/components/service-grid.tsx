import { useMemo } from 'react'
import type { Service } from '@/types/service.ts'
import { ServiceCard } from './service-card.tsx'
import { EmptyState } from '@/components/shared/empty-state.tsx'
import { SearchIcon } from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'
import { getServiceConsumerCount } from '@/mocks/handlers.ts'

interface ServiceGridProps {
  services: Service[]
  onClearFilters?: () => void
}

export function ServiceGrid({ services, onClearFilters }: ServiceGridProps) {
  const consumerCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const s of services) {
      counts[s.id] = getServiceConsumerCount(s.id)
    }
    return counts
  }, [services])

  if (services.length === 0) {
    return (
      <EmptyState
        icon={<SearchIcon className="h-12 w-12" />}
        title="No services found"
        description="Try adjusting your search or filters to find what you're looking for."
        action={
          onClearFilters ? (
            <Button variant="outline" size="sm" onClick={onClearFilters}>
              Clear filters
            </Button>
          ) : undefined
        }
      />
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {services.map((service) => (
        <ServiceCard key={service.id} service={service} consumerCount={consumerCounts[service.id] ?? 0} />
      ))}
    </div>
  )
}
