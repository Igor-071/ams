import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router'
import { AlertTriangleIcon } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header.tsx'
import { StatusBadge } from '@/components/shared/status-badge.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Switch } from '@/components/ui/switch.tsx'
import { Label } from '@/components/ui/label.tsx'
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
  approveMerchantOnboarding,
  rejectMerchantOnboarding,
  disableMerchant,
  flagMerchantForReview,
  blockMerchantSubscriptions,
} from '@/mocks/handlers.ts'
import { ROUTES } from '@/lib/constants.ts'

type ConfirmAction = 'suspend' | 'unsuspend' | 'approve' | 'reject' | 'disable' | null

export function AdminMerchantDetailPage() {
  const { merchantId } = useParams<{ merchantId: string }>()
  const navigate = useNavigate()
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const user = useMemo(() => getUserById(merchantId ?? ''), [merchantId, refreshKey]) // eslint-disable-line react-hooks/exhaustive-deps
  const profile = useMemo(() => getMerchantProfile(merchantId ?? ''), [merchantId, refreshKey]) // eslint-disable-line react-hooks/exhaustive-deps
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
    } else if (confirmAction === 'approve') {
      approveMerchantOnboarding(user.id)
    } else if (confirmAction === 'reject') {
      rejectMerchantOnboarding(user.id)
    } else if (confirmAction === 'disable') {
      disableMerchant(user.id)
    }
    setConfirmAction(null)
    setRefreshKey((k) => k + 1)
  }

  const handleFlagToggle = (checked: boolean) => {
    flagMerchantForReview(user.id, checked)
    setRefreshKey((k) => k + 1)
  }

  const handleSubscriptionsToggle = (checked: boolean) => {
    blockMerchantSubscriptions(user.id, checked)
    setRefreshKey((k) => k + 1)
  }

  const dialogConfig: Record<string, { title: string; description: string; variant: 'destructive' | 'default'; label: string }> = {
    suspend: { title: 'Suspend Merchant?', description: 'This will prevent the merchant from managing their services.', variant: 'destructive', label: 'Suspend' },
    unsuspend: { title: 'Unsuspend Merchant?', description: "This will restore the merchant's access to the platform.", variant: 'default', label: 'Unsuspend' },
    approve: { title: 'Approve Merchant?', description: 'This will activate the merchant account and allow them to create services.', variant: 'default', label: 'Approve' },
    reject: { title: 'Reject Merchant?', description: 'This will permanently disable the merchant account.', variant: 'destructive', label: 'Reject' },
    disable: { title: 'Disable Merchant?', description: 'This will permanently disable the merchant. All active services will be suspended. This action cannot be undone.', variant: 'destructive', label: 'Disable' },
  }

  const renderActions = () => {
    switch (user.status) {
      case 'pending':
        return (
          <div className="flex gap-2">
            <Button className="rounded-full" onClick={() => setConfirmAction('approve')}>
              Approve
            </Button>
            <Button variant="destructive" className="rounded-full" onClick={() => setConfirmAction('reject')}>
              Reject
            </Button>
          </div>
        )
      case 'active':
        return (
          <div className="flex gap-2">
            <Button variant="destructive" className="rounded-full" onClick={() => setConfirmAction('suspend')}>
              Suspend Merchant
            </Button>
            <Button variant="destructive" className="rounded-full" onClick={() => setConfirmAction('disable')}>
              Disable Merchant
            </Button>
          </div>
        )
      case 'suspended':
        return (
          <div className="flex gap-2">
            <Button className="rounded-full" onClick={() => setConfirmAction('unsuspend')}>
              Unsuspend Merchant
            </Button>
            <Button variant="destructive" className="rounded-full" onClick={() => setConfirmAction('disable')}>
              Disable Merchant
            </Button>
          </div>
        )
      case 'disabled':
        return null
      default:
        return null
    }
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
        actions={renderActions()}
      />

      {user.status === 'disabled' && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
          <AlertTriangleIcon className="h-5 w-5 text-red-400" />
          <p className="text-sm text-red-400">
            This merchant account has been permanently disabled. No further actions can be taken.
          </p>
        </div>
      )}

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

        {user.status !== 'disabled' && (
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-lg font-light">
                Compliance Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="flag-review">Flagged for Review</Label>
                  <p className="text-xs text-muted-foreground">Mark merchant for compliance review</p>
                </div>
                <Switch
                  id="flag-review"
                  checked={profile?.flaggedForReview ?? false}
                  onCheckedChange={handleFlagToggle}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="block-subscriptions">Block Subscriptions</Label>
                  <p className="text-xs text-muted-foreground">Prevent new consumer access requests</p>
                </div>
                <Switch
                  id="block-subscriptions"
                  checked={profile?.subscriptionsBlocked ?? false}
                  onCheckedChange={handleSubscriptionsToggle}
                />
              </div>
            </CardContent>
          </Card>
        )}
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
            <div className="rounded-2xl border border-white/[0.12]">
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
              onClick={handleAction}
            >
              {confirmAction ? dialogConfig[confirmAction]?.label : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
