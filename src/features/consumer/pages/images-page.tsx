import { useState, useMemo } from 'react'
import { ContainerIcon, ChevronDownIcon, SearchIcon, CheckCircleIcon, Loader2Icon } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header.tsx'
import { Card, CardContent } from '@/components/ui/card.tsx'
import { EmptyState } from '@/components/shared/empty-state.tsx'
import { CopyButton } from '@/components/shared/copy-button.tsx'
import { StatusBadge } from '@/components/shared/status-badge.tsx'
import { LicenseBadge } from '@/components/shared/license-badge.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Input } from '@/components/ui/input.tsx'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.tsx'
import { useAuthStore } from '@/stores/auth-store.ts'
import { getDockerImagesForConsumer, generatePullToken, getServiceById } from '@/mocks/handlers.ts'
import { ROUTES } from '@/lib/constants.ts'
import type { DockerImage } from '@/types/docker.ts'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const PULL_STEPS = [
  'Entitlement Check',
  'License Validation',
  'Team Verification',
  'Token Generation',
]

export function ImagesPage() {
  const { currentUser } = useAuthStore()
  const consumerId = currentUser?.id ?? ''

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [licensingFilter, setLicensingFilter] = useState('all')
  const [pullDialogImage, setPullDialogImage] = useState<DockerImage | null>(null)
  const [pullStep, setPullStep] = useState(0)
  const [generatedToken, setGeneratedToken] = useState<{ token: string; expiresAt: string } | null>(null)

  const allImages = useMemo(
    () => getDockerImagesForConsumer(consumerId),
    [consumerId],
  )

  const filteredImages = useMemo(() => {
    let items = [...allImages]
    if (search) {
      const lower = search.toLowerCase()
      items = items.filter(
        (img) =>
          img.name.toLowerCase().includes(lower) ||
          img.tag.toLowerCase().includes(lower),
      )
    }
    if (statusFilter !== 'all') {
      items = items.filter((img) => img.status === statusFilter)
    }
    if (licensingFilter !== 'all') {
      items = items.filter((img) => img.licensingModel === licensingFilter)
    }
    return items
  }, [allImages, search, statusFilter, licensingFilter])

  const openPullDialog = (image: DockerImage) => {
    setPullDialogImage(image)
    setPullStep(0)
    setGeneratedToken(null)
  }

  const handleGenerateToken = () => {
    if (!pullDialogImage) return
    const result = generatePullToken(consumerId, pullDialogImage.id)
    setGeneratedToken(result)
    setPullStep(4)
  }

  const maskedToken = generatedToken
    ? `${generatedToken.token.slice(0, 12)}****...****`
    : ''

  return (
    <div className="space-y-6">
      <PageHeader
        title="Docker Images"
        description="Available Docker images for your subscribed services"
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.CONSUMER_DASHBOARD },
          { label: 'Docker Images' },
        ]}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search images..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
            className="h-10 appearance-none rounded-full border border-white/20 bg-card pl-4 pr-12 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="deprecated">Deprecated</option>
            <option value="disabled">Disabled</option>
          </select>
          <ChevronDownIcon className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
        <div className="relative">
          <select
            value={licensingFilter}
            onChange={(e) => setLicensingFilter(e.target.value)}
            aria-label="Filter by licensing"
            className="h-10 appearance-none rounded-full border border-white/20 bg-card pl-4 pr-12 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Licensing</option>
            <option value="online">Online</option>
            <option value="offline-ttl">Offline-TTL</option>
          </select>
          <ChevronDownIcon className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      {filteredImages.length === 0 ? (
        <EmptyState
          icon={<ContainerIcon className="h-12 w-12" />}
          title="No Docker images available"
          description="Subscribe to Docker-type services to see available images here."
        />
      ) : (
        <div className="space-y-4">
          {filteredImages.map((image) => {
            const service = getServiceById(image.serviceId)
            return (
              <Card key={image.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 space-y-1">
                      <p className="font-heading font-light text-foreground">
                        {image.name}:{image.tag}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatBytes(image.sizeBytes)} &middot; {image.license} &middot; v{image.version}
                        {service && <> &middot; {service.name}</>}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <StatusBadge status={image.status} />
                        <LicenseBadge status={image.licenseStatus} />
                        <span className="text-xs text-muted-foreground">
                          {image.licensingModel}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {image.status === 'active' && (
                        <Button
                          size="sm"
                          className="rounded-full"
                          onClick={() => openPullDialog(image)}
                        >
                          Request Pull Access
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-lg border border-white/[0.12] bg-background/50 p-3">
                    <code className="flex-1 break-all text-sm text-foreground">
                      {image.pullCommand}
                    </code>
                    <CopyButton value={image.pullCommand} />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog
        open={pullDialogImage !== null}
        onOpenChange={() => setPullDialogImage(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Pull Access — {pullDialogImage?.name}:{pullDialogImage?.tag}</DialogTitle>
            <DialogDescription>
              Complete the validation steps to generate a scoped pull token.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {PULL_STEPS.map((step, index) => (
              <div
                key={step}
                className="flex items-center gap-3 rounded-lg border border-white/[0.12] px-3 py-2"
              >
                {index < pullStep ? (
                  <CheckCircleIcon className="h-4 w-4 text-emerald-400" />
                ) : index === pullStep && pullStep < 4 ? (
                  <Loader2Icon className="h-4 w-4 text-primary animate-spin" />
                ) : (
                  <div className="h-4 w-4 rounded-full border border-white/20" />
                )}
                <span className="text-sm text-foreground">{step}</span>
              </div>
            ))}
          </div>

          {generatedToken && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 rounded-lg border border-white/[0.12] bg-background/50 p-3">
                <code className="flex-1 break-all text-sm text-foreground">
                  {maskedToken}
                </code>
                <CopyButton value={generatedToken.token} />
              </div>
              <p className="text-xs text-muted-foreground">
                Expires in 30 min ({new Date(generatedToken.expiresAt).toLocaleTimeString()})
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setPullDialogImage(null)}
            >
              Close
            </Button>
            {!generatedToken && (
              <Button
                className="rounded-full"
                onClick={handleGenerateToken}
              >
                Generate Token
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
