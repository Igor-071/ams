import { useState, useMemo } from 'react'
import { useParams } from 'react-router'
import { PageHeader } from '@/components/shared/page-header.tsx'
import { Button } from '@/components/ui/button.tsx'
import { StatusBadge } from '@/components/shared/status-badge.tsx'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.tsx'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table.tsx'
import {
  getServiceById,
  getApiKeysForService,
  getUsageRecords,
  revokeApiKey,
} from '@/mocks/handlers.ts'
import { ROUTES } from '@/lib/constants.ts'

export function MerchantServiceConsumersPage() {
  const { serviceId } = useParams<{ serviceId: string }>()
  const [revokeKeyId, setRevokeKeyId] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const service = useMemo(() => getServiceById(serviceId ?? ''), [serviceId])

  const keys = useMemo(
    () => getApiKeysForService(serviceId ?? ''),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [serviceId, refreshKey],
  )

  const keyRows = useMemo(
    () =>
      keys.map((key) => {
        const usage = getUsageRecords({ serviceId: serviceId ?? '', apiKeyId: key.id })
        return {
          id: key.id,
          name: key.name,
          prefix: key.keyPrefix,
          status: key.status,
          usageCount: usage.total,
        }
      }),
    [keys, serviceId],
  )

  if (!service) {
    return (
      <div className="space-y-6">
        <PageHeader title="Service Not Found" />
        <p className="text-muted-foreground">This service does not exist.</p>
      </div>
    )
  }

  const handleRevoke = () => {
    if (!revokeKeyId) return
    revokeApiKey(revokeKeyId, 'merchant')
    setRevokeKeyId(null)
    setRefreshKey((k) => k + 1)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${service.name} — Consumers`}
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.MERCHANT_DASHBOARD },
          { label: 'Services', href: ROUTES.MERCHANT_SERVICES },
          { label: service.name, href: ROUTES.MERCHANT_SERVICE_DETAIL(service.id) },
          { label: 'Consumers' },
        ]}
      />

      <div className="rounded-2xl border border-white/[0.06]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Key Name</TableHead>
              <TableHead>Prefix</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Requests</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {keyRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No API keys for this service
                </TableCell>
              </TableRow>
            ) : (
              keyRows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell>
                    <code className="text-xs text-muted-foreground">
                      {row.prefix}...
                    </code>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={row.status} />
                  </TableCell>
                  <TableCell className="text-right">{row.usageCount}</TableCell>
                  <TableCell>
                    {row.status === 'active' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="rounded-full"
                        onClick={() => setRevokeKeyId(row.id)}
                      >
                        Revoke
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={revokeKeyId !== null} onOpenChange={() => setRevokeKeyId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke this API key?</DialogTitle>
            <DialogDescription>
              This will immediately prevent the consumer from using this key to access your service.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setRevokeKeyId(null)}
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
