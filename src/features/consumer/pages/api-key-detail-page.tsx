import { useState, useMemo } from 'react'
import { useParams } from 'react-router'
import { PageHeader } from '@/components/shared/page-header.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { Button } from '@/components/ui/button.tsx'
import { StatusBadge } from '@/components/shared/status-badge.tsx'
import { CopyButton } from '@/components/shared/copy-button.tsx'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.tsx'
import { getApiKeyById, getServiceById, revokeApiKey } from '@/mocks/handlers.ts'
import { ROUTES } from '@/lib/constants.ts'

export function ApiKeyDetailPage() {
  const { keyId } = useParams<{ keyId: string }>()
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false)
  const [keyStatus, setKeyStatus] = useState<string | null>(null)

  const key = useMemo(() => getApiKeyById(keyId ?? ''), [keyId])

  if (!key) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Key Not Found"
          breadcrumbs={[
            { label: 'Dashboard', href: ROUTES.CONSUMER_DASHBOARD },
            { label: 'API Keys', href: ROUTES.CONSUMER_API_KEYS },
            { label: 'Not Found' },
          ]}
        />
        <p className="text-muted-foreground">This API key does not exist.</p>
      </div>
    )
  }

  const currentStatus = keyStatus ?? key.status
  const maskedValue = `${key.keyPrefix}...`

  const services = key.serviceIds
    .map((id) => getServiceById(id))
    .filter((s): s is NonNullable<typeof s> => s != null)

  const handleRevoke = () => {
    revokeApiKey(key.id)
    setKeyStatus('revoked')
    setRevokeDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={key.name}
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.CONSUMER_DASHBOARD },
          { label: 'API Keys', href: ROUTES.CONSUMER_API_KEYS },
          { label: key.name },
        ]}
        actions={
          currentStatus === 'active' ? (
            <Button
              variant="destructive"
              className="rounded-full"
              onClick={() => setRevokeDialogOpen(true)}
            >
              Revoke Key
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg font-light">
              Key Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <StatusBadge status={currentStatus} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Key Value</p>
              <div className="mt-1 flex items-center gap-2">
                <code className="text-sm text-foreground">{maskedValue}</code>
                <CopyButton value={maskedValue} />
              </div>
            </div>
            {key.description && (
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="text-sm text-foreground">{key.description}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="text-sm text-foreground">
                {new Date(key.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Expires</p>
              <p className="text-sm text-foreground">
                {new Date(key.expiresAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">TTL</p>
              <p className="text-sm text-foreground">{key.ttlDays} days</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg font-light">
              Assigned Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            {services.length === 0 ? (
              <p className="text-sm text-muted-foreground">No services assigned</p>
            ) : (
              <div className="space-y-2">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center justify-between rounded-lg border border-white/[0.12] p-3"
                  >
                    <span className="text-sm text-foreground">{service.name}</span>
                    <StatusBadge status={service.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke this API key?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The key will immediately stop working.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setRevokeDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="rounded-full"
              onClick={handleRevoke}
            >
              Revoke
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
