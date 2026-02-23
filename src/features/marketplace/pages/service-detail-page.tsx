import { useParams, Link } from 'react-router'
import { ArrowLeftIcon, ExternalLinkIcon, CloudIcon, ContainerIcon, GaugeIcon, LockIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { Button } from '@/components/ui/button.tsx'
import { EmptyState } from '@/components/shared/empty-state.tsx'
import { ROUTES } from '@/lib/constants.ts'
import { getServiceById } from '@/mocks/handlers.ts'
import { PricingDisplay } from '../components/pricing-display.tsx'
import { AccessRequestButton } from '../components/access-request-button.tsx'

export function ServiceDetailPage() {
  const { serviceId } = useParams<{ serviceId: string }>()
  const service = serviceId ? getServiceById(serviceId) : undefined

  if (!service || service.status !== 'active') {
    return (
      <div className="py-12">
        <EmptyState
          title="Service not found"
          description="The service you're looking for doesn't exist or is no longer available."
          action={
            <Button asChild variant="outline" size="sm">
              <Link to={ROUTES.MARKETPLACE}>Back to Marketplace</Link>
            </Button>
          }
        />
      </div>
    )
  }

  const TypeIcon = service.type === 'api' ? CloudIcon : ContainerIcon
  const typeLabel = service.type === 'api' ? 'API' : 'Docker'
  const typeClass = service.type === 'api'
    ? 'bg-blue-500/15 text-blue-400'
    : 'bg-purple-500/15 text-purple-400'

  return (
    <div className="space-y-6">
      <Link
        to={ROUTES.MARKETPLACE}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back to Marketplace
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          <div>
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <h1 className="font-heading text-2xl font-light tracking-tight text-foreground">
                  {service.name}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  by {service.merchantName}
                </p>
                {service.visibility === 'private' && (
                  <p className="mt-1 text-xs text-amber-400">
                    This service is not listed in the marketplace catalog
                  </p>
                )}
              </div>
              <div className="flex gap-1.5">
                {service.visibility === 'private' && (
                  <Badge variant="secondary" className="bg-amber-500/15 text-amber-400 text-xs">
                    <LockIcon className="mr-1 h-3 w-3" />
                    Private
                  </Badge>
                )}
                <Badge variant="secondary" className={`text-xs ${typeClass}`}>
                  <TypeIcon className="mr-1 h-3 w-3" />
                  {typeLabel}
                </Badge>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-base font-light">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {service.description}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-base font-light">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Category</span>
                <span className="text-foreground">{service.category}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Rate limit</span>
                <span className="flex items-center gap-1 text-foreground">
                  <GaugeIcon className="h-3.5 w-3.5" />
                  {service.rateLimitPerMinute > 0
                    ? `${service.rateLimitPerMinute} requests/minute`
                    : 'Unlimited'}
                </span>
              </div>
              {service.documentationUrl && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Documentation</span>
                  <a
                    href={service.documentationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    View Documentation
                    <ExternalLinkIcon className="h-3 w-3" />
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {service.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {service.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-xs text-muted-foreground"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-base font-light">Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <PricingDisplay pricing={service.pricing} />
            </CardContent>
          </Card>

          <AccessRequestButton service={service} />
        </div>
      </div>
    </div>
  )
}
