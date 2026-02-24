import { useParams, Link } from 'react-router'
import {
  ArrowLeftIcon,
  ExternalLinkIcon,
  CloudIcon,
  ContainerIcon,
  GaugeIcon,
  LockIcon,
  CheckCircle2Icon,
  CalendarIcon,
  StoreIcon,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { Button } from '@/components/ui/button.tsx'
import { EmptyState } from '@/components/shared/empty-state.tsx'
import { CopyButton } from '@/components/shared/copy-button.tsx'
import { ROUTES } from '@/lib/constants.ts'
import { formatDate, formatBytes } from '@/lib/format.ts'
import {
  getServiceById,
  getMerchantServiceCount,
  getDockerImagesByService,
} from '@/mocks/handlers.ts'
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
  const typeClass =
    service.type === 'api'
      ? 'bg-blue-500/15 text-blue-400'
      : 'bg-purple-500/15 text-purple-400'

  const merchantServiceCount = getMerchantServiceCount(service.merchantId)
  const dockerImages = service.type === 'docker' ? getDockerImagesByService(service.id) : []
  const latestImage = dockerImages.length > 0 ? dockerImages[0] : undefined
  const description = service.longDescription ?? service.description

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
          {/* A. Header */}
          <div>
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <h1 className="font-heading text-2xl font-light tracking-tight text-foreground">
                  {service.name}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  by {service.merchantName}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  <CalendarIcon className="mr-1 inline h-3 w-3" />
                  Updated {formatDate(service.updatedAt)}
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
                {service.version && (
                  <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-400 text-xs">
                    v{service.version}
                  </Badge>
                )}
                <Badge variant="secondary" className={`text-xs ${typeClass}`}>
                  <TypeIcon className="mr-1 h-3 w-3" />
                  {typeLabel}
                </Badge>
              </div>
            </div>
          </div>

          {/* B. Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-base font-light">Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            </CardContent>
          </Card>

          {/* D. Features */}
          {service.features && service.features.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-base font-light">Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2Icon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* E. Technical Details */}
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-base font-light">Technical Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Category</span>
                <span className="text-foreground">{service.category}</span>
              </div>
              {service.type === 'api' && service.endpoint && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Base URL</span>
                  <span className="text-foreground font-mono text-xs">{service.endpoint.baseUrl}</span>
                </div>
              )}
              {service.responseFormat && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Response Format</span>
                  <span className="text-foreground">{service.responseFormat}</span>
                </div>
              )}
              {service.authMethod && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Authentication</span>
                  <span className="text-foreground">{service.authMethod}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Rate limit</span>
                <span className="flex items-center gap-1 text-foreground">
                  <GaugeIcon className="h-3.5 w-3.5" />
                  {service.rateLimitPerMinute > 0
                    ? `${service.rateLimitPerMinute} requests/minute`
                    : 'Unlimited'}
                </span>
              </div>
              {service.version && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Version</span>
                  <span className="text-foreground">{service.version}</span>
                </div>
              )}
              {service.type === 'docker' && latestImage && (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Images</span>
                    <span className="text-foreground">{dockerImages.length} available</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Latest Tag</span>
                    <span className="text-foreground font-mono text-xs">{latestImage.tag}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Image Size</span>
                    <span className="text-foreground">{formatBytes(latestImage.sizeBytes)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">License</span>
                    <span className="text-foreground">{latestImage.license}</span>
                  </div>
                </>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Created</span>
                <span className="text-foreground">{formatDate(service.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Last Updated</span>
                <span className="text-foreground">{formatDate(service.updatedAt)}</span>
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
              {service.tags.length > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tags</span>
                  <div className="flex flex-wrap justify-end gap-1.5">
                    {service.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs text-muted-foreground">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* F. Quick Start */}
          {service.quickStart && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-heading text-base font-light">Quick Start</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-white/5 text-xs text-muted-foreground font-mono">
                      {service.quickStart.language}
                    </Badge>
                    <CopyButton value={service.quickStart.code} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="overflow-x-auto rounded-lg bg-[#0a0e17] p-4 text-xs leading-relaxed text-emerald-400 font-mono">
                  <code>{service.quickStart.code}</code>
                </pre>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Provider Card */}
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-base font-light">Provider</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                  <StoreIcon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{service.merchantName}</p>
                  <p className="text-xs text-muted-foreground">
                    {merchantServiceCount} active {merchantServiceCount === 1 ? 'service' : 'services'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

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
