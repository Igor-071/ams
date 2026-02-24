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
  getServiceBlocksForService,
  blockConsumerForService,
  unblockConsumerForService,
  getUserById,
} from '@/mocks/handlers.ts'
import { useAuthStore } from '@/stores/auth-store.ts'
import { ROUTES } from '@/lib/constants.ts'

export function MerchantServiceConsumersPage() {
  const { serviceId } = useParams<{ serviceId: string }>()
  const { currentUser } = useAuthStore()
  const [revokeKeyId, setRevokeKeyId] = useState<string | null>(null)
  const [blockAction, setBlockAction] = useState<{
    type: 'block' | 'unblock'
    consumerId: string
    consumerName: string
  } | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const service = useMemo(() => getServiceById(serviceId ?? ''), [serviceId])

  const keys = useMemo(
    () => getApiKeysForService(serviceId ?? ''),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [serviceId, refreshKey],
  )

  const serviceBlocks = useMemo(
    () => getServiceBlocksForService(serviceId ?? ''),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [serviceId, refreshKey],
  )

  const blockedConsumerIds = useMemo(
    () => new Set(serviceBlocks.map((b) => b.consumerId)),
    [serviceBlocks],
  )

  const keyRows = useMemo(
    () =>
      keys.map((key) => {
        const usage = getUsageRecords({ serviceId: serviceId ?? '', apiKeyId: key.id })
        const consumer = getUserById(key.consumerId)
        return {
          id: key.id,
          name: key.name,
          prefix: key.keyPrefix,
          status: key.status,
          usageCount: usage.total,
          consumerId: key.consumerId,
          consumerName: consumer?.name ?? key.consumerId,
          isBlocked: blockedConsumerIds.has(key.consumerId),
        }
      }),
    [keys, serviceId, blockedConsumerIds],
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

  const handleBlockAction = () => {
    if (!blockAction || !currentUser) return
    if (blockAction.type === 'block') {
      blockConsumerForService(
        blockAction.consumerId,
        serviceId ?? '',
        currentUser.id,
        currentUser.name,
      )
    } else {
      unblockConsumerForService(
        blockAction.consumerId,
        serviceId ?? '',
        currentUser.id,
        currentUser.name,
      )
    }
    setBlockAction(null)
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

      <div className="rounded-2xl border border-white/[0.12]">
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
                  <TableCell className="font-medium">
                    {row.name}
                    {row.isBlocked && (
                      <StatusBadge status="blocked" className="ml-2" />
                    )}
                  </TableCell>
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
                    <div className="flex items-center justify-end gap-2">
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
                      {row.isBlocked ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                          onClick={() =>
                            setBlockAction({
                              type: 'unblock',
                              consumerId: row.consumerId,
                              consumerName: row.consumerName,
                            })
                          }
                        >
                          Unblock
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full text-red-400 border-red-400/30"
                          onClick={() =>
                            setBlockAction({
                              type: 'block',
                              consumerId: row.consumerId,
                              consumerName: row.consumerName,
                            })
                          }
                        >
                          Block
                        </Button>
                      )}
                    </div>
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

      <Dialog open={blockAction !== null} onOpenChange={() => setBlockAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {blockAction?.type === 'block' ? 'Block Consumer' : 'Unblock Consumer'}
            </DialogTitle>
            <DialogDescription>
              {blockAction?.type === 'block'
                ? `Are you sure you want to block ${blockAction.consumerName} from this service? They will receive 403 errors on all requests.`
                : `Are you sure you want to unblock ${blockAction?.consumerName}? They will be able to consume this service again.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setBlockAction(null)}
            >
              Cancel
            </Button>
            <Button
              variant={blockAction?.type === 'block' ? 'destructive' : 'default'}
              className="rounded-full"
              onClick={handleBlockAction}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
