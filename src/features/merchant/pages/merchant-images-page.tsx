import { useState, useMemo } from 'react'
import { ContainerIcon, ChevronDownIcon, ChevronRightIcon, SearchIcon } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header.tsx'
import { Card, CardContent } from '@/components/ui/card.tsx'
import { EmptyState } from '@/components/shared/empty-state.tsx'
import { CopyButton } from '@/components/shared/copy-button.tsx'
import { StatusBadge } from '@/components/shared/status-badge.tsx'
import { LicenseBadge } from '@/components/shared/license-badge.tsx'
import { ImageValidationPipeline } from '@/features/merchant/components/image-validation-pipeline.tsx'
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
import { getDockerImagesByMerchant, deprecateImage, disableImage } from '@/mocks/handlers.ts'
import { ROUTES } from '@/lib/constants.ts'
import type { DockerImage } from '@/types/docker.ts'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function MerchantImagesPage() {
  const { currentUser } = useAuthStore()
  const merchantId = currentUser?.id ?? ''
  const merchantName = currentUser?.name ?? ''

  const [refreshKey, setRefreshKey] = useState(0)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [licensingFilter, setLicensingFilter] = useState('all')
  const [expandedPipelines, setExpandedPipelines] = useState<Set<string>>(new Set())
  const [actionDialog, setActionDialog] = useState<{
    type: 'deprecate' | 'disable'
    image: DockerImage
  } | null>(null)

  const allImages = useMemo(
    () => getDockerImagesByMerchant(merchantId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [merchantId, refreshKey],
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

  const togglePipeline = (imageId: string) => {
    setExpandedPipelines((prev) => {
      const next = new Set(prev)
      if (next.has(imageId)) {
        next.delete(imageId)
      } else {
        next.add(imageId)
      }
      return next
    })
  }

  const handleAction = () => {
    if (!actionDialog) return
    const { type, image } = actionDialog
    if (type === 'deprecate') {
      deprecateImage(image.id, merchantId, merchantName)
    } else {
      disableImage(image.id, merchantId, merchantName)
    }
    setActionDialog(null)
    setRefreshKey((k) => k + 1)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Docker Images"
        description="Manage Docker images for your services"
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.MERCHANT_DASHBOARD },
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
            aria-label="Filter by licensing model"
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
          title="No Docker images"
          description="No images match your current filters."
        />
      ) : (
        <div className="space-y-4">
          {filteredImages.map((image) => {
            const pushCommand = `docker push registry.ams.io/${image.name}:${image.tag}`
            const isExpanded = expandedPipelines.has(image.id)

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
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <StatusBadge status={image.status} />
                        <LicenseBadge status={image.licenseStatus} />
                        <span className="text-xs text-muted-foreground">
                          {image.licensingModel}
                        </span>
                      </div>
                      {image.licensingModel === 'offline-ttl' && image.ttlExpiresAt && (
                        <p className="text-xs text-muted-foreground">
                          TTL Expires: {new Date(image.ttlExpiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{image.pullCount.toLocaleString()} pulls</span>
                        <span>{image.executionCount.toLocaleString()} runs</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {image.status === 'active' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full text-amber-400 border-amber-400/30"
                            onClick={() => setActionDialog({ type: 'deprecate', image })}
                          >
                            Deprecate
                          </Button>
                        )}
                        {image.status !== 'disabled' && (
                          <Button
                            variant="destructive"
                            size="sm"
                            className="rounded-full"
                            onClick={() => setActionDialog({ type: 'disable', image })}
                          >
                            Disable
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-lg border border-white/[0.12] bg-background/50 p-3">
                    <code className="flex-1 break-all text-sm text-foreground">
                      {pushCommand}
                    </code>
                    <CopyButton value={pushCommand} />
                  </div>

                  <div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-xs text-muted-foreground"
                      onClick={() => togglePipeline(image.id)}
                      aria-label="Show pipeline"
                    >
                      {isExpanded ? (
                        <ChevronDownIcon className="h-3 w-3" />
                      ) : (
                        <ChevronRightIcon className="h-3 w-3" />
                      )}
                      Validation Pipeline
                    </Button>
                    {isExpanded && (
                      <div className="mt-2 pl-2">
                        <ImageValidationPipeline steps={image.validationSteps} />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={actionDialog !== null} onOpenChange={() => setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog?.type === 'deprecate' ? 'Deprecate Image' : 'Disable Image'}
            </DialogTitle>
            <DialogDescription>
              {actionDialog?.type === 'deprecate'
                ? `Are you sure you want to deprecate ${actionDialog.image.name}:${actionDialog.image.tag}? The image will still be pullable but marked as deprecated.`
                : `Are you sure you want to disable ${actionDialog?.image.name}:${actionDialog?.image.tag}? The image will no longer be available for pulling.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setActionDialog(null)}
            >
              Cancel
            </Button>
            <Button
              variant={actionDialog?.type === 'deprecate' ? 'default' : 'destructive'}
              className="rounded-full"
              onClick={handleAction}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
