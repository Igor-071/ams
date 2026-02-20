import { useState } from 'react'
import { useNavigate } from 'react-router'
import { CheckCircle2Icon, ClockIcon } from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.tsx'
import { useAuthStore } from '@/stores/auth-store.ts'
import { ROUTES } from '@/lib/constants.ts'
import { getAccessRequestForService, createAccessRequest } from '@/mocks/handlers.ts'
import { mockDelay } from '@/mocks/delay.ts'
import type { Service } from '@/types/service.ts'

interface AccessRequestButtonProps {
  service: Service
}

export function AccessRequestButton({ service }: AccessRequestButtonProps) {
  const currentUser = useAuthStore((s) => s.currentUser)
  const navigate = useNavigate()
  const [loginDialogOpen, setLoginDialogOpen] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [requestStatus, setRequestStatus] = useState<string | null>(() => {
    if (!currentUser) return null
    const existing = getAccessRequestForService(currentUser.id, service.id)
    return existing?.status ?? null
  })

  async function handleRequestAccess() {
    if (!currentUser) {
      setLoginDialogOpen(true)
      return
    }
    setConfirmDialogOpen(true)
  }

  async function handleConfirmRequest() {
    if (!currentUser) return
    setLoading(true)
    await mockDelay()
    createAccessRequest({
      consumerId: currentUser.id,
      consumerName: currentUser.name,
      serviceId: service.id,
      serviceName: service.name,
    })
    setRequestStatus('pending')
    setLoading(false)
    setConfirmDialogOpen(false)
  }

  // Already approved
  if (requestStatus === 'approved') {
    return (
      <Button disabled className="w-full bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/15">
        <CheckCircle2Icon className="mr-2 h-4 w-4" />
        Access Granted
      </Button>
    )
  }

  // Pending
  if (requestStatus === 'pending') {
    return (
      <Button disabled className="w-full bg-amber-500/15 text-amber-400 hover:bg-amber-500/15">
        <ClockIcon className="mr-2 h-4 w-4" />
        Pending Approval
      </Button>
    )
  }

  return (
    <>
      {requestStatus === 'denied' && (
        <p className="mb-2 text-center text-xs text-muted-foreground">
          Previous request was denied
        </p>
      )}

      <Button className="w-full" onClick={handleRequestAccess} disabled={loading}>
        Request Access
      </Button>

      {/* Login prompt dialog */}
      <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading font-light">Sign in to request access</DialogTitle>
            <DialogDescription>
              You need to be signed in to request access to services.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLoginDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => navigate(ROUTES.LOGIN)}>
              Sign In
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm request dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading font-light">Request access to {service.name}?</DialogTitle>
            <DialogDescription>
              Your request will be reviewed by an administrator. You'll be notified when it's approved.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleConfirmRequest} disabled={loading}>
              {loading ? 'Submitting...' : 'Confirm Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
