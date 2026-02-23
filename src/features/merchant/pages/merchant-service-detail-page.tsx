import { useState, useMemo } from 'react'
import { useParams } from 'react-router'
import { PageHeader } from '@/components/shared/page-header.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Label } from '@/components/ui/label.tsx'
import { GlobeIcon, LockIcon, PencilIcon } from 'lucide-react'
import { StatusBadge } from '@/components/shared/status-badge.tsx'
import { ConsumptionEndpointDocs } from '../components/consumption-endpoint-docs.tsx'
import { ConsumptionSimulator } from '../components/consumption-simulator.tsx'
import { UsagePipelineViz } from '../components/usage-pipeline-viz.tsx'
import { getServiceById, updateService } from '@/mocks/handlers.ts'
import { useAuthStore } from '@/stores/auth-store.ts'
import { ROUTES } from '@/lib/constants.ts'
import type { ServiceVisibility, PricingModel } from '@/types/service.ts'

export function MerchantServiceDetailPage() {
  const { serviceId } = useParams<{ serviceId: string }>()
  const { currentUser } = useAuthStore()
  const [refreshKey, setRefreshKey] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  const service = useMemo(
    () => getServiceById(serviceId ?? ''),
    [serviceId, refreshKey], // eslint-disable-line react-hooks/exhaustive-deps
  )

  // Edit state
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editTags, setEditTags] = useState('')
  const [editVisibility, setEditVisibility] = useState<ServiceVisibility>('public')
  const [editPricingType, setEditPricingType] = useState<PricingModel['type']>('free')
  const [editPricePerRequest, setEditPricePerRequest] = useState('0.001')
  const [editRateLimit, setEditRateLimit] = useState('0')
  const [editEndpointUrl, setEditEndpointUrl] = useState('')
  const [editHttpMethod, setEditHttpMethod] = useState('GET')

  const enterEditMode = () => {
    if (!service) return
    setEditName(service.name)
    setEditDescription(service.description)
    setEditCategory(service.category)
    setEditTags(service.tags.join(', '))
    setEditVisibility(service.visibility)
    setEditPricingType(service.pricing.type)
    setEditPricePerRequest(String(service.pricing.pricePerRequest ?? 0.001))
    setEditRateLimit(String(service.rateLimitPerMinute))
    setEditEndpointUrl(service.endpoint?.baseUrl ?? '')
    setEditHttpMethod(service.endpoint?.method ?? 'GET')
    setSaveMessage(null)
    setIsEditing(true)
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setSaveMessage(null)
  }

  const handleSave = () => {
    if (!service || !currentUser) return
    if (!editName.trim() || !editDescription.trim() || !editCategory.trim()) return

    const pricing: PricingModel =
      service.type === 'docker' || editPricingType === 'free'
        ? { type: 'free' }
        : { type: editPricingType, pricePerRequest: Number(editPricePerRequest), currency: 'USD' }

    updateService(
      service.id,
      {
        name: editName.trim(),
        description: editDescription.trim(),
        category: editCategory.trim(),
        tags: editTags.split(',').map((t) => t.trim()).filter(Boolean),
        visibility: editVisibility,
        pricing,
        rateLimitPerMinute: service.type === 'api' ? Number(editRateLimit) : service.rateLimitPerMinute,
        endpoint:
          service.type === 'api' && editEndpointUrl
            ? { baseUrl: editEndpointUrl, method: editHttpMethod as 'GET' | 'POST' | 'PUT' | 'DELETE' }
            : service.endpoint,
      },
      currentUser.id,
      currentUser.name,
    )
    setRefreshKey((k) => k + 1)
    setSaveMessage('Service updated successfully')
    setIsEditing(false)
  }

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
        actions={
          isEditing ? (
            <div className="flex gap-2">
              <Button className="rounded-full" onClick={handleSave}>
                Save Changes
              </Button>
              <Button variant="outline" className="rounded-full" onClick={cancelEdit}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button variant="outline" className="rounded-full" onClick={enterEditMode}>
              <PencilIcon className="mr-1.5 h-3.5 w-3.5" />
              Edit
            </Button>
          )
        }
      />

      {saveMessage && (
        <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-3">
          <p className="text-sm text-green-400">{saveMessage}</p>
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
              <p className="text-sm text-muted-foreground">Status</p>
              <StatusBadge status={service.status === 'pending_approval' ? 'pending' : service.status} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Type</p>
              <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                {service.type.toUpperCase()}
              </Badge>
            </div>

            {isEditing ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Name *</Label>
                  <Input
                    id="edit-name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-desc">Description *</Label>
                  <Input
                    id="edit-desc"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category *</Label>
                  <Input
                    id="edit-category"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-tags">Tags</Label>
                  <Input
                    id="edit-tags"
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Visibility</Label>
                  <div className="flex gap-2">
                    {([
                      { value: 'public' as ServiceVisibility, label: 'Public', Icon: GlobeIcon },
                      { value: 'private' as ServiceVisibility, label: 'Private', Icon: LockIcon },
                    ]).map(({ value, label, Icon }) => (
                      <Button
                        key={value}
                        type="button"
                        variant={editVisibility === value ? 'default' : 'outline'}
                        size="sm"
                        className="rounded-full"
                        onClick={() => setEditVisibility(value)}
                      >
                        <Icon className="mr-1.5 h-3.5 w-3.5" />
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>

                {service.type === 'api' && (
                  <>
                    <div className="space-y-2">
                      <Label>Pricing Model</Label>
                      <div className="flex gap-2 flex-wrap">
                        {(['free', 'per_request', 'tiered', 'flat'] as PricingModel['type'][]).map(
                          (pt) => (
                            <Button
                              key={pt}
                              type="button"
                              variant={editPricingType === pt ? 'default' : 'outline'}
                              size="sm"
                              className="rounded-full"
                              onClick={() => setEditPricingType(pt)}
                            >
                              {pt.replace('_', ' ')}
                            </Button>
                          ),
                        )}
                      </div>
                    </div>
                    {editPricingType !== 'free' && (
                      <div className="space-y-2">
                        <Label htmlFor="edit-price">Price per Request ($)</Label>
                        <Input
                          id="edit-price"
                          type="number"
                          step="0.001"
                          min="0"
                          value={editPricePerRequest}
                          onChange={(e) => setEditPricePerRequest(e.target.value)}
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="edit-rate">Rate Limit (per minute)</Label>
                      <Input
                        id="edit-rate"
                        type="number"
                        min="0"
                        value={editRateLimit}
                        onChange={(e) => setEditRateLimit(e.target.value)}
                      />
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
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
              </>
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
              {isEditing ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="edit-endpoint">Base URL</Label>
                    <Input
                      id="edit-endpoint"
                      value={editEndpointUrl}
                      onChange={(e) => setEditEndpointUrl(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>HTTP Method</Label>
                    <div className="flex gap-2">
                      {['GET', 'POST', 'PUT', 'DELETE'].map((m) => (
                        <Button
                          key={m}
                          type="button"
                          variant={editHttpMethod === m ? 'default' : 'outline'}
                          size="sm"
                          className="rounded-full"
                          onClick={() => setEditHttpMethod(m)}
                        >
                          {m}
                        </Button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
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
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {service.type === 'api' && (
        <>
          <ConsumptionSimulator serviceId={service.id} />
          <UsagePipelineViz />
          <ConsumptionEndpointDocs />
        </>
      )}
    </div>
  )
}
