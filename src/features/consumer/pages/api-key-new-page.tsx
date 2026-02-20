import { useState, useMemo } from 'react'
import { Link } from 'react-router'
import { CheckCircle2Icon, AlertTriangleIcon } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Label } from '@/components/ui/label.tsx'
import { CopyButton } from '@/components/shared/copy-button.tsx'
import { useAuthStore } from '@/stores/auth-store.ts'
import { getAccessRequestsByConsumer, getServiceById, createApiKey } from '@/mocks/handlers.ts'
import { ROUTES } from '@/lib/constants.ts'

export function ApiKeyNewPage() {
  const { currentUser } = useAuthStore()
  const consumerId = currentUser?.id ?? ''

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([])
  const [ttlDays, setTtlDays] = useState(90)
  const [generatedKey, setGeneratedKey] = useState<string | null>(null)
  const [generatedKeyId, setGeneratedKeyId] = useState<string | null>(null)

  const approvedServices = useMemo(() => {
    const requests = getAccessRequestsByConsumer(consumerId).filter(
      (r) => r.status === 'approved',
    )
    return requests
      .map((r) => getServiceById(r.serviceId))
      .filter((s): s is NonNullable<typeof s> => s != null)
  }, [consumerId])

  const toggleService = (serviceId: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId],
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const key = createApiKey({
      consumerId,
      name: name.trim(),
      description: description.trim() || undefined,
      serviceIds: selectedServiceIds,
      ttlDays,
    })
    setGeneratedKey(key.keyValue)
    setGeneratedKeyId(key.id)
  }

  if (generatedKey && generatedKeyId) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Key Generated"
          breadcrumbs={[
            { label: 'Dashboard', href: ROUTES.CONSUMER_DASHBOARD },
            { label: 'API Keys', href: ROUTES.CONSUMER_API_KEYS },
            { label: 'Generated' },
          ]}
        />
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2Icon className="h-5 w-5" />
              <span className="font-heading font-light">API Key Created Successfully</span>
            </div>

            <div className="rounded-lg border border-white/[0.12] bg-background/50 p-4">
              <div className="flex items-center justify-between gap-2">
                <code className="break-all text-sm text-foreground">
                  {generatedKey}
                </code>
                <CopyButton value={generatedKey} />
              </div>
            </div>

            <div className="flex items-center gap-2 text-amber-400">
              <AlertTriangleIcon className="h-4 w-4" />
              <p className="text-sm">
                Copy this key now. It won't be shown again.
              </p>
            </div>

            <div className="flex gap-3">
              <Button className="rounded-full" asChild>
                <Link to={ROUTES.CONSUMER_API_KEY_DETAIL(generatedKeyId)}>
                  View Key Details
                </Link>
              </Button>
              <Button variant="outline" className="rounded-full" asChild>
                <Link to={ROUTES.CONSUMER_API_KEYS}>Back to Keys</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Generate New Key"
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.CONSUMER_DASHBOARD },
          { label: 'API Keys', href: ROUTES.CONSUMER_API_KEYS },
          { label: 'New' },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg font-light">
            Key Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="e.g. Production Key"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Optional description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Services</Label>
              {approvedServices.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No approved services available.
                </p>
              ) : (
                <div className="space-y-2">
                  {approvedServices.map((service) => (
                    <label
                      key={service.id}
                      className="flex items-center gap-2 rounded-lg border border-white/[0.12] p-3 cursor-pointer hover:bg-white/[0.02]"
                    >
                      <input
                        type="checkbox"
                        checked={selectedServiceIds.includes(service.id)}
                        onChange={() => toggleService(service.id)}
                        className="h-4 w-4 rounded"
                      />
                      <span className="text-sm">{service.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ttl">TTL (days) *</Label>
              <Input
                id="ttl"
                type="number"
                min={1}
                max={365}
                placeholder="e.g. 30"
                value={ttlDays}
                onChange={(e) => setTtlDays(Number(e.target.value))}
                required
              />
            </div>

            <Button type="submit" className="rounded-full">
              Generate Key
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
