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
  blockConsumer,
  unblockConsumer,
  approveAccessRequest,
  denyAccessRequest,
} from '@/mocks/handlers.ts'
import { ROUTES } from '@/lib/constants.ts'

export function AdminConsumerDetailPage() {
  const { consumerId } = useParams<{ consumerId: string }>()
  const [confirmAction, setConfirmAction] = useState<'block' | 'unblock' | null>(null)
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
        <CardHeader>
          <CardTitle className="font-heading text-lg font-light">
            Access Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          {accessRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground">No access requests</p>
          ) : (
            <div className="rounded-2xl border border-white/[0.06]">
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
              {confirmAction === 'block' ? 'Block Consumer?' : 'Unblock Consumer?'}
            </DialogTitle>
            <DialogDescription>
              {confirmAction === 'block'
                ? 'This will revoke all active API keys and prevent the consumer from accessing services.'
                : 'This will restore the consumer\'s access to the platform.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" className="rounded-full" onClick={() => setConfirmAction(null)}>
              Cancel
            </Button>
            <Button
              variant={confirmAction === 'block' ? 'destructive' : 'default'}
              className="rounded-full"
              onClick={handleBlockAction}
            >
              {confirmAction === 'block' ? 'Block' : 'Unblock'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
