import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router'
import { PageHeader } from '@/components/shared/page-header.tsx'
import { StatusBadge } from '@/components/shared/status-badge.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { Badge } from '@/components/ui/badge.tsx'
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
  getMerchantProfile,
  getServicesByMerchant,
  suspendMerchant,
  unsuspendMerchant,
} from '@/mocks/handlers.ts'
import { ROUTES } from '@/lib/constants.ts'

export function AdminMerchantDetailPage() {
  const { merchantId } = useParams<{ merchantId: string }>()
  const navigate = useNavigate()
  const [confirmAction, setConfirmAction] = useState<'suspend' | 'unsuspend' | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const user = useMemo(() => getUserById(merchantId ?? ''), [merchantId, refreshKey]) // eslint-disable-line react-hooks/exhaustive-deps
  const profile = useMemo(() => getMerchantProfile(merchantId ?? ''), [merchantId])
  const services = useMemo(
    () => getServicesByMerchant(merchantId ?? '', { pageSize: 100 }).data,
    [merchantId],
  )

  if (!user) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Merchant Not Found"
          breadcrumbs={[
            { label: 'Admin', href: ROUTES.ADMIN_DASHBOARD },
            { label: 'Merchants', href: ROUTES.ADMIN_MERCHANTS },
            { label: 'Not Found' },
          ]}
        />
        <p className="text-muted-foreground">This merchant does not exist.</p>
      </div>
    )
  }

  const handleAction = () => {
    if (confirmAction === 'suspend') {
      suspendMerchant(user.id)
    } else if (confirmAction === 'unsuspend') {
      unsuspendMerchant(user.id)
    }
    setConfirmAction(null)
    setRefreshKey((k) => k + 1)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={user.name}
        breadcrumbs={[
          { label: 'Admin', href: ROUTES.ADMIN_DASHBOARD },
          { label: 'Merchants', href: ROUTES.ADMIN_MERCHANTS },
          { label: user.name },
        ]}
        actions={
          user.status === 'active' ? (
            <Button
              variant="destructive"
              className="rounded-full"
              onClick={() => setConfirmAction('suspend')}
            >
              Suspend Merchant
            </Button>
          ) : user.status === 'suspended' ? (
            <Button
              className="rounded-full"
              onClick={() => setConfirmAction('unsuspend')}
            >
              Unsuspend Merchant
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
              <p className="text-sm text-muted-foreground">Company</p>
              <p className="text-sm text-foreground">{profile?.companyName ?? '—'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <StatusBadge status={user.status} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Invited</p>
              <p className="text-sm text-foreground">
                {profile?.invitedAt ? new Date(profile.invitedAt).toLocaleDateString() : '—'}
              </p>
            </div>
            {profile?.website && (
              <div>
                <p className="text-sm text-muted-foreground">Website</p>
                <p className="text-sm text-foreground">{profile.website}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg font-light">
            Services
          </CardTitle>
        </CardHeader>
        <CardContent>
          {services.length === 0 ? (
            <p className="text-sm text-muted-foreground">No services</p>
          ) : (
            <div className="rounded-2xl border border-white/[0.06]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((svc) => (
                    <TableRow
                      key={svc.id}
                      className="cursor-pointer"
                      onClick={() => navigate(ROUTES.ADMIN_SERVICE_DETAIL(svc.id))}
                    >
                      <TableCell className="font-medium">{svc.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                          {svc.type.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={svc.status === 'pending_approval' ? 'pending' : svc.status} />
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
              {confirmAction === 'suspend' ? 'Suspend Merchant?' : 'Unsuspend Merchant?'}
            </DialogTitle>
            <DialogDescription>
              {confirmAction === 'suspend'
                ? 'This will prevent the merchant from managing their services.'
                : 'This will restore the merchant\'s access to the platform.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" className="rounded-full" onClick={() => setConfirmAction(null)}>
              Cancel
            </Button>
            <Button
              variant={confirmAction === 'suspend' ? 'destructive' : 'default'}
              className="rounded-full"
              onClick={handleAction}
            >
              {confirmAction === 'suspend' ? 'Suspend' : 'Unsuspend'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
