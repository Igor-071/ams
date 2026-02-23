import { useState, useMemo } from 'react'
import { useParams } from 'react-router'
import { PageHeader } from '@/components/shared/page-header.tsx'
import { StatusBadge } from '@/components/shared/status-badge.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { LockIcon } from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'
import { getServiceById, approveService, rejectService } from '@/mocks/handlers.ts'
import { ROUTES } from '@/lib/constants.ts'

export function AdminServiceDetailPage() {
  const { serviceId } = useParams<{ serviceId: string }>()
  const [refreshKey, setRefreshKey] = useState(0)
  const [actionMessage, setActionMessage] = useState<string | null>(null)

  const service = useMemo(
    () => getServiceById(serviceId ?? ''),
    [serviceId, refreshKey], // eslint-disable-line react-hooks/exhaustive-deps
  )

  if (!service) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Service Not Found"
          breadcrumbs={[
            { label: 'Admin', href: ROUTES.ADMIN_DASHBOARD },
            { label: 'Services', href: ROUTES.ADMIN_SERVICES },
            { label: 'Not Found' },
          ]}
        />
        <p className="text-muted-foreground">This service does not exist.</p>
      </div>
    )
  }

  const handleApprove = () => {
    approveService(service.id)
    setActionMessage('Service approved successfully')
    setRefreshKey((k) => k + 1)
  }

  const handleReject = () => {
    rejectService(service.id)
    setActionMessage('Service rejected')
    setRefreshKey((k) => k + 1)
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
          { label: 'Admin', href: ROUTES.ADMIN_DASHBOARD },
          { label: 'Services', href: ROUTES.ADMIN_SERVICES },
          { label: service.name },
        ]}
        actions={
          service.status === 'pending_approval' ? (
            <div className="flex gap-2">
              <Button className="rounded-full" onClick={handleApprove}>
                Approve
              </Button>
              <Button variant="destructive" className="rounded-full" onClick={handleReject}>
                Reject
              </Button>
            </div>
          ) : null
        }
      />

      {actionMessage && (
        <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-3">
          <p className="text-sm text-green-400">{actionMessage}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg font-light">
              Service Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Merchant</p>
              <p className="text-sm text-foreground">{service.merchantName}</p>
            </div>
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
              <p className="text-sm text-muted-foreground">Visibility</p>
              <Badge
                variant="secondary"
                className={
                  service.visibility === 'private'
                    ? 'bg-amber-500/15 text-amber-400 text-xs'
                    : 'bg-emerald-500/15 text-emerald-400 text-xs'
                }
              >
                {service.visibility === 'private' && <LockIcon className="mr-1 h-3 w-3" />}
                {service.visibility === 'private' ? 'Private' : 'Public'}
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
                <p className="text-sm text-foreground">{service.rateLimitPerMinute} req/min</p>
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
            {service.updatedAt && (
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="text-sm text-foreground">
                  {new Date(service.updatedAt).toLocaleString()}
                </p>
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
    </div>
  )
}
