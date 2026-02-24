import { useMemo } from 'react'
import { PageHeader } from '@/components/shared/page-header.tsx'
import { StatusBadge } from '@/components/shared/status-badge.tsx'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table.tsx'
import { useAuthStore } from '@/stores/auth-store.ts'
import { getAccessRequestsByConsumer } from '@/mocks/handlers.ts'
import { ROUTES } from '@/lib/constants.ts'

function requestStatusToBadge(status: string): string {
  if (status === 'approved') return 'active'
  if (status === 'denied') return 'rejected'
  return 'pending'
}

export function RequestsPage() {
  const { currentUser } = useAuthStore()
  const consumerId = currentUser?.id ?? ''

  const requests = useMemo(
    () => getAccessRequestsByConsumer(consumerId),
    [consumerId],
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Requests"
        description="Track your service access requests"
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.CONSUMER_DASHBOARD },
          { label: 'Requests' },
        ]}
      />

      <div className="rounded-2xl border border-white/[0.12]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Requested</TableHead>
              <TableHead>Resolved</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No access requests
                </TableCell>
              </TableRow>
            ) : (
              requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="font-medium">{req.serviceName}</TableCell>
                  <TableCell>
                    <StatusBadge status={requestStatusToBadge(req.status)} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(req.requestedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {req.resolvedAt ? new Date(req.resolvedAt).toLocaleDateString() : '—'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
