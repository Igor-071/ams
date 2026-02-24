import { useState, useMemo } from 'react'
import { useParams } from 'react-router'
import { PageHeader } from '@/components/shared/page-header.tsx'
import { StatusBadge } from '@/components/shared/status-badge.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { Button } from '@/components/ui/button.tsx'
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
  getUserById,
  getConsumerProfile,
  getAccessRequestsByConsumer,
  getUsageRecords,
  getApiKeysByConsumer,
  blockConsumer,
  unblockConsumer,
  approveAccessRequest,
  denyAccessRequest,
  adminRevokeApiKey,
  adminRevokeAllConsumerKeys,
  forceRegenerateApiKey,
} from '@/mocks/handlers.ts'
import { ROUTES } from '@/lib/constants.ts'

type ConfirmAction = 'block' | 'unblock' | 'revoke-all' | null

export function AdminConsumerDetailPage() {
  const { consumerId } = useParams<{ consumerId: string }>()
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const user = useMemo(() => getUserById(consumerId ?? ''), [consumerId, refreshKey]) // eslint-disable-line react-hooks/exhaustive-deps
  const profile = useMemo(() => getConsumerProfile(consumerId ?? ''), [consumerId])
  const accessRequests = useMemo(
    () => getAccessRequestsByConsumer(consumerId ?? ''),
    [consumerId, refreshKey], // eslint-disable-line react-hooks/exhaustive-deps
  )
  const usage = useMemo(
    () => getUsageRecords({ consumerId: consumerId ?? '', pageSize: 1000 }),
    [consumerId],
  )
  const apiKeys = useMemo(
    () => getApiKeysByConsumer(consumerId ?? '', { pageSize: 100 }).data,
    [consumerId, refreshKey], // eslint-disable-line react-hooks/exhaustive-deps
  )

  if (!user) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Consumer Not Found"
          breadcrumbs={[
            { label: 'Admin', href: ROUTES.ADMIN_DASHBOARD },
            { label: 'Consumers', href: ROUTES.ADMIN_CONSUMERS },
            { label: 'Not Found' },
          ]}
        />
        <p className="text-muted-foreground">This consumer does not exist.</p>
      </div>
    )
  }

  const handleBlockAction = () => {
    if (confirmAction === 'block') {
      blockConsumer(user.id)
    } else if (confirmAction === 'unblock') {
      unblockConsumer(user.id)
    } else if (confirmAction === 'revoke-all') {
      adminRevokeAllConsumerKeys(user.id)
    }
    setConfirmAction(null)
    setRefreshKey((k) => k + 1)
  }

  const handleApprove = (requestId: string) => {
    approveAccessRequest(requestId)
    setRefreshKey((k) => k + 1)
  }

  const handleDeny = (requestId: string) => {
    denyAccessRequest(requestId)
    setRefreshKey((k) => k + 1)
  }

  const handleRevokeKey = (keyId: string) => {
    adminRevokeApiKey(keyId)
    setRefreshKey((k) => k + 1)
  }

  const handleForceRegenerate = (keyId: string) => {
    forceRegenerateApiKey(keyId)
    setRefreshKey((k) => k + 1)
  }

  const dialogConfig: Record<string, { title: string; description: string; variant: 'destructive' | 'default'; label: string }> = {
    block: { title: 'Block Consumer?', description: 'This will revoke all active API keys and prevent the consumer from accessing services.', variant: 'destructive', label: 'Block' },
    unblock: { title: 'Unblock Consumer?', description: "This will restore the consumer's access to the platform.", variant: 'default', label: 'Unblock' },
    'revoke-all': { title: 'Revoke All API Keys?', description: 'This will immediately revoke all active API keys for this consumer. This action cannot be undone.', variant: 'destructive', label: 'Revoke All' },
  }

  const activeKeyCount = apiKeys.filter((k) => k.status === 'active').length

  return (
    <div className="space-y-6">
      <PageHeader
        title={user.name}
        breadcrumbs={[
          { label: 'Admin', href: ROUTES.ADMIN_DASHBOARD },
          { label: 'Consumers', href: ROUTES.ADMIN_CONSUMERS },
          { label: user.name },
        ]}
        actions={
          user.status === 'active' ? (
            <Button
              variant="destructive"
              className="rounded-full"
              onClick={() => setConfirmAction('block')}
            >
              Block Consumer
            </Button>
          ) : user.status === 'blocked' ? (
            <Button
              className="rounded-full"
              onClick={() => setConfirmAction('unblock')}
            >
              Unblock Consumer
            </Button>
          ) : null
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg font-light">
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="text-sm text-foreground">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Organization</p>
              <p className="text-sm text-foreground">{profile?.organization ?? '—'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <StatusBadge status={user.status} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Requests</p>
              <p className="text-sm text-foreground">{usage.total}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-heading text-lg font-light">
            API Keys
          </CardTitle>
          {activeKeyCount > 0 && (
            <Button
              variant="destructive"
              size="sm"
              className="rounded-full"
              onClick={() => setConfirmAction('revoke-all')}
            >
              Revoke All Keys
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {apiKeys.length === 0 ? (
            <p className="text-sm text-muted-foreground">No API keys</p>
          ) : (
            <div className="rounded-2xl border border-white/[0.12]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((key) => (
                    <TableRow key={key.id}>
                      <TableCell className="font-medium">{key.name}</TableCell>
                      <TableCell>
                        <StatusBadge status={key.status} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(key.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {key.status === 'active' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="destructive"
                              className="rounded-full"
                              onClick={() => handleRevokeKey(key.id)}
                            >
                              Revoke
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-full"
                              onClick={() => handleForceRegenerate(key.id)}
                            >
                              Force Regenerate
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg font-light">
            Access Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          {accessRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground">No access requests</p>
          ) : (
            <div className="rounded-2xl border border-white/[0.12]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accessRequests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-medium">{req.serviceName}</TableCell>
                      <TableCell>
                        <StatusBadge status={req.status === 'approved' ? 'active' : req.status === 'denied' ? 'expired' : 'pending'} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(req.requestedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {req.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="rounded-full"
                              onClick={() => handleApprove(req.id)}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="rounded-full"
                              onClick={() => handleDeny(req.id)}
                            >
                              Deny
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={confirmAction !== null} onOpenChange={() => setConfirmAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction ? dialogConfig[confirmAction]?.title : ''}
            </DialogTitle>
            <DialogDescription>
              {confirmAction ? dialogConfig[confirmAction]?.description : ''}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" className="rounded-full" onClick={() => setConfirmAction(null)}>
              Cancel
            </Button>
            <Button
              variant={confirmAction ? dialogConfig[confirmAction]?.variant : 'default'}
              className="rounded-full"
              onClick={handleBlockAction}
            >
              {confirmAction ? dialogConfig[confirmAction]?.label : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
