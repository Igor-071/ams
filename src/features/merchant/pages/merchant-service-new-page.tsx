import { useState } from 'react'
import { useNavigate } from 'react-router'
import { PageHeader } from '@/components/shared/page-header.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Label } from '@/components/ui/label.tsx'
import { useAuthStore } from '@/stores/auth-store.ts'
import { mockMerchantProfiles } from '@/mocks/data/users.ts'
import { createService } from '@/mocks/handlers.ts'
import { ROUTES } from '@/lib/constants.ts'
import type { ServiceType, PricingModel } from '@/types/service.ts'

export function MerchantServiceNewPage() {
  const { currentUser } = useAuthStore()
  const navigate = useNavigate()
  const merchantId = currentUser?.id ?? ''
  const profile = mockMerchantProfiles.find((p) => p.userId === merchantId)

  const [serviceType, setServiceType] = useState<ServiceType>('api')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState('')
  const [pricingType, setPricingType] = useState<PricingModel['type']>('per_request')
  const [pricePerRequest, setPricePerRequest] = useState('0.001')
  const [rateLimit, setRateLimit] = useState('60')
  const [endpointUrl, setEndpointUrl] = useState('')
  const [httpMethod, setHttpMethod] = useState('GET')
  const [license, setLicense] = useState('Apache-2.0')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !description.trim() || !category.trim()) return

    const pricing: PricingModel =
      serviceType === 'docker' || pricingType === 'free'
        ? { type: 'free' }
        : { type: pricingType, pricePerRequest: Number(pricePerRequest), currency: 'USD' }

    const service = createService({
      merchantId,
      merchantName: profile?.companyName ?? currentUser?.name ?? '',
      name: name.trim(),
      description: description.trim(),
      type: serviceType,
      category: category.trim(),
      pricing,
      rateLimitPerMinute: serviceType === 'api' ? Number(rateLimit) : 0,
      endpoint:
        serviceType === 'api' && endpointUrl
          ? { baseUrl: endpointUrl, method: httpMethod as 'GET' | 'POST' | 'PUT' | 'DELETE' }
          : undefined,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    })
    navigate(ROUTES.MERCHANT_SERVICE_DETAIL(service.id))
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Service"
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.MERCHANT_DASHBOARD },
          { label: 'Services', href: ROUTES.MERCHANT_SERVICES },
          { label: 'New' },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg font-light">
            Service Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <div className="flex gap-2">
                {(['api', 'docker'] as ServiceType[]).map((t) => (
                  <Button
                    key={t}
                    type="button"
                    variant={serviceType === t ? 'default' : 'outline'}
                    className="rounded-full"
                    onClick={() => setServiceType(t)}
                  >
                    {t.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="svc-name">Name *</Label>
              <Input
                id="svc-name"
                placeholder="e.g. Weather API"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="svc-desc">Description *</Label>
              <Input
                id="svc-desc"
                placeholder="Describe your service"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="svc-category">Category *</Label>
              <Input
                id="svc-category"
                placeholder="e.g. Data, AI/ML, Infrastructure"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="svc-tags">Tags</Label>
              <Input
                id="svc-tags"
                placeholder="Comma-separated tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>

            {serviceType === 'api' && (
              <>
                <div className="space-y-2">
                  <Label>Pricing Model</Label>
                  <div className="flex gap-2 flex-wrap">
                    {(['free', 'per_request', 'tiered', 'flat'] as PricingModel['type'][]).map(
                      (pt) => (
                        <Button
                          key={pt}
                          type="button"
                          variant={pricingType === pt ? 'default' : 'outline'}
                          size="sm"
                          className="rounded-full"
                          onClick={() => setPricingType(pt)}
                        >
                          {pt.replace('_', ' ')}
                        </Button>
                      ),
                    )}
                  </div>
                </div>

                {pricingType !== 'free' && (
                  <div className="space-y-2">
                    <Label htmlFor="svc-price">Price per Request ($)</Label>
                    <Input
                      id="svc-price"
                      type="number"
                      step="0.001"
                      min="0"
                      value={pricePerRequest}
                      onChange={(e) => setPricePerRequest(e.target.value)}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="svc-rate">Rate Limit (per minute)</Label>
                  <Input
                    id="svc-rate"
                    type="number"
                    min="0"
                    value={rateLimit}
                    onChange={(e) => setRateLimit(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="svc-endpoint">Endpoint Base URL</Label>
                  <Input
                    id="svc-endpoint"
                    placeholder="https://api.example.com/v1"
                    value={endpointUrl}
                    onChange={(e) => setEndpointUrl(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="svc-method">HTTP Method</Label>
                  <div className="flex gap-2">
                    {['GET', 'POST', 'PUT', 'DELETE'].map((m) => (
                      <Button
                        key={m}
                        type="button"
                        variant={httpMethod === m ? 'default' : 'outline'}
                        size="sm"
                        className="rounded-full"
                        onClick={() => setHttpMethod(m)}
                      >
                        {m}
                      </Button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {serviceType === 'docker' && (
              <div className="space-y-2">
                <Label htmlFor="svc-license">License</Label>
                <Input
                  id="svc-license"
                  placeholder="e.g. Apache-2.0, MIT"
                  value={license}
                  onChange={(e) => setLicense(e.target.value)}
                />
              </div>
            )}

            <Button type="submit" className="rounded-full">
              Submit for Approval
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
