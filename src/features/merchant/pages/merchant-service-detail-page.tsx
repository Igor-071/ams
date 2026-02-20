import { useMemo } from 'react'
import { useParams } from 'react-router'
import { PageHeader } from '@/components/shared/page-header.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { StatusBadge } from '@/components/shared/status-badge.tsx'
import { ConsumptionEndpointDocs } from '../components/consumption-endpoint-docs.tsx'
import { getServiceById } from '@/mocks/handlers.ts'
import { ROUTES } from '@/lib/constants.ts'

export function MerchantServiceDetailPage() {
  const { serviceId } = useParams<{ serviceId: string }>()
  const service = useMemo(() => getServiceById(serviceId ?? ''), [serviceId])

  if (!service) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Service Not Found"
          breadcrumbs={[
            { label: 'Dashboard', href: ROUTES.MERCHANT_DASHBOARD },
            { label: 'Services', href: ROUTES.MERCHANT_SERVICES },
            { label: 'Not Found' },
          ]}
        />
        <p className="text-muted-foreground">This service does not exist.</p>
      </div>
    )
  }

  const pricingLabel =
    service.pricing.type === 'free'
      ? 'Free'
      : service.pricing.type === 'per_request'
        ? `$${service.pricing.pricePerRequest}/req`
        : service.pricing.type === 'tiered'
          ? 'Tiered'
          : 'Flat'

  return (
    <div className="space-y-6">
      <PageHeader
        title={service.name}
        description={service.description}
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.MERCHANT_DASHBOARD },
          { label: 'Services', href: ROUTES.MERCHANT_SERVICES },
          { label: service.name },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg font-light">
              Service Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <StatusBadge status={service.status === 'pending_approval' ? 'pending' : service.status} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Type</p>
              <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                {service.type.toUpperCase()}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Category</p>
              <p className="text-sm text-foreground">{service.category}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pricing</p>
              <p className="text-sm text-foreground">{pricingLabel}</p>
            </div>
            {service.rateLimitPerMinute > 0 && (
              <div>
                <p className="text-sm text-muted-foreground">Rate Limit</p>
                <p className="text-sm text-foreground">
                  {service.rateLimitPerMinute} req/min
                </p>
              </div>
            )}
            {service.tags.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground">Tags</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {service.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {service.endpoint && (
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-lg font-light">
                Endpoint Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Base URL</p>
                <code className="text-sm text-foreground">{service.endpoint.baseUrl}</code>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Method</p>
                <Badge variant="secondary" className="text-xs">
                  {service.endpoint.method}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {service.type === 'api' && <ConsumptionEndpointDocs />}
    </div>
  )
}
