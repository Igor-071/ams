import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { ChevronDownIcon, AlertTriangleIcon } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header.tsx'
import { StatusBadge } from '@/components/shared/status-badge.tsx'
import { CopyButton } from '@/components/shared/copy-button.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Input } from '@/components/ui/input.tsx'
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
import { getUsers, getMerchantProfile, createMerchantInvite } from '@/mocks/handlers.ts'
import { ROUTES } from '@/lib/constants.ts'

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'disabled', label: 'Disabled' },
] as const

export function AdminMerchantsPage() {
  const navigate = useNavigate()
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteResult, setInviteResult] = useState<{ code: string; link: string } | null>(null)
  const [statusFilter, setStatusFilter] = useState('all')

  const merchants = useMemo(() => {
    const users = getUsers({ pageSize: 1000 }).data
    return users
      .filter((u) => u.roles.includes('merchant'))
      .map((u) => {
        const profile = getMerchantProfile(u.id)
        return {
          ...u,
          companyName: profile?.companyName ?? '',
          invitedAt: profile?.invitedAt ?? '',
          flaggedForReview: profile?.flaggedForReview ?? false,
          subscriptionsBlocked: profile?.subscriptionsBlocked ?? false,
        }
      })
  }, [])

  const filteredMerchants = useMemo(() => {
    if (statusFilter === 'all') return merchants
    return merchants.filter((m) => m.status === statusFilter)
  }, [merchants, statusFilter])

  const handleInvite = () => {
    if (!inviteEmail.trim()) return
    const result = createMerchantInvite(inviteEmail.trim())
    setInviteResult(result)
  }

  const handleCloseInvite = () => {
    setInviteOpen(false)
    setInviteEmail('')
    setInviteResult(null)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Merchants"
        description="Manage merchant accounts"
        breadcrumbs={[
          { label: 'Admin', href: ROUTES.ADMIN_DASHBOARD },
          { label: 'Merchants' },
        ]}
        actions={
          <Button className="rounded-full" onClick={() => setInviteOpen(true)}>
            Invite Merchant
          </Button>
        }
      />

      <div className="flex items-center gap-3">
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
            className="glass-select h-10 appearance-none rounded-full pl-4 pr-12 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.12]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Invited</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMerchants.map((m) => (
              <TableRow
                key={m.id}
                className="cursor-pointer"
                onClick={() => navigate(ROUTES.ADMIN_MERCHANT_DETAIL(m.id))}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {m.name}
                    {m.flaggedForReview && (
                      <AlertTriangleIcon className="h-4 w-4 text-amber-400" data-testid={`flagged-${m.id}`} />
                    )}
                  </div>
                </TableCell>
                <TableCell>{m.companyName}</TableCell>
                <TableCell>
                  <StatusBadge status={m.status} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {m.invitedAt ? new Date(m.invitedAt).toLocaleDateString() : '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={inviteOpen} onOpenChange={handleCloseInvite}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Merchant</DialogTitle>
            <DialogDescription>
              Generate an invite code and send the registration link.
            </DialogDescription>
          </DialogHeader>
          {!inviteResult ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invite-email">Email</Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="merchant@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" className="rounded-full" onClick={handleCloseInvite}>
                  Cancel
                </Button>
                <Button className="rounded-full" onClick={handleInvite}>
                  Generate Invite
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Invite Code</p>
                <div className="flex items-center gap-2 rounded-lg border border-white/[0.12] bg-background/50 p-3">
                  <code className="flex-1 text-sm text-foreground">{inviteResult.code}</code>
                  <CopyButton value={inviteResult.code} />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Registration Link</p>
                <div className="flex items-center gap-2 rounded-lg border border-white/[0.12] bg-background/50 p-3">
                  <code className="flex-1 break-all text-sm text-foreground">{inviteResult.link}</code>
                  <CopyButton value={inviteResult.link} />
                </div>
              </div>
              <DialogFooter>
                <Button className="rounded-full" onClick={handleCloseInvite}>
                  Done
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
