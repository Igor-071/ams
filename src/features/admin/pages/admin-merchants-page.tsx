import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router'
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

export function AdminMerchantsPage() {
  const navigate = useNavigate()
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteResult, setInviteResult] = useState<{ code: string; link: string } | null>(null)

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
        }
      })
  }, [])

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

      <div className="rounded-2xl border border-white/[0.06]">
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
            {merchants.map((m) => (
              <TableRow
                key={m.id}
                className="cursor-pointer"
                onClick={() => navigate(ROUTES.ADMIN_MERCHANT_DETAIL(m.id))}
              >
                <TableCell className="font-medium">{m.name}</TableCell>
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
                <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-background/50 p-3">
                  <code className="flex-1 text-sm text-foreground">{inviteResult.code}</code>
                  <CopyButton value={inviteResult.code} />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Registration Link</p>
                <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-background/50 p-3">
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
