import { Link } from 'react-router'
import { CloudIcon, ContainerIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { ROUTES } from '@/lib/constants.ts'
import type { Service } from '@/types/service.ts'

function formatPricing(service: Service): string {
  switch (service.pricing.type) {
    case 'free':
      return 'Free'
    case 'per_request':
      return `$${service.pricing.pricePerRequest}/req`
    case 'tiered':
      return 'Tiered pricing'
    case 'flat':
      return 'Flat rate'
    default:
      return 'Contact'
  }
}

const typeConfig = {
  api: {
    label: 'API',
    icon: CloudIcon,
    className: 'bg-blue-500/15 text-blue-400',
  },
  docker: {
    label: 'Docker',
    icon: ContainerIcon,
    className: 'bg-purple-500/15 text-purple-400',
  },
}

interface ServiceCardProps {
  service: Service
}

export function ServiceCard({ service }: ServiceCardProps) {
  const config = typeConfig[service.type]
  const TypeIcon = config.icon

  return (
    <Link to={ROUTES.MARKETPLACE_SERVICE(service.id)} data-testid={`service-card-${service.id}`}>
      <Card className="h-full transition-all hover:border-primary/30 hover:shadow-[0_0_20px_rgba(0,102,255,0.08)]">
        <CardContent className="flex h-full flex-col gap-3 p-5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-heading text-base font-light text-foreground truncate">
                {service.name}
              </h3>
              <p className="text-xs text-muted-foreground">{service.merchantName}</p>
            </div>
            <Badge variant="secondary" className={`shrink-0 text-xs ${config.className}`}>
              <TypeIcon className="mr-1 h-3 w-3" />
              {config.label}
            </Badge>
          </div>

          <p className="flex-1 text-sm text-muted-foreground line-clamp-2">
            {service.description}
          </p>

          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{service.category}</span>
            <span className="font-medium text-foreground">{formatPricing(service)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
