import { useMemo } from 'react'
import { ContainerIcon } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header.tsx'
import { Card, CardContent } from '@/components/ui/card.tsx'
import { EmptyState } from '@/components/shared/empty-state.tsx'
import { CopyButton } from '@/components/shared/copy-button.tsx'
import { useAuthStore } from '@/stores/auth-store.ts'
import { getDockerImagesByMerchant, getServiceById } from '@/mocks/handlers.ts'
import { ROUTES } from '@/lib/constants.ts'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function MerchantImagesPage() {
  const { currentUser } = useAuthStore()
  const merchantId = currentUser?.id ?? ''

  const images = useMemo(
    () => getDockerImagesByMerchant(merchantId),
    [merchantId],
  )

  // Group images by service
  const groupedImages = useMemo(() => {
    const groups = new Map<string, { serviceName: string; images: typeof images }>()
    for (const img of images) {
      const existing = groups.get(img.serviceId)
      if (existing) {
        existing.images.push(img)
      } else {
        const service = getServiceById(img.serviceId)
        groups.set(img.serviceId, {
          serviceName: service?.name ?? 'Unknown',
          images: [img],
        })
      }
    }
    return Array.from(groups.entries())
  }, [images])

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

      {groupedImages.length === 0 ? (
        <EmptyState
          icon={<ContainerIcon className="h-12 w-12" />}
          title="No Docker images"
          description="Create a Docker-type service to manage images."
        />
      ) : (
        groupedImages.map(([serviceId, group]) => (
          <div key={serviceId} className="space-y-3">
            <h2 className="font-heading text-lg font-light text-foreground">
              {group.serviceName}
            </h2>
            {group.images.map((image) => {
              const pushCommand = `docker push registry.ams.io/${image.name}:${image.tag}`
              return (
                <Card key={image.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 space-y-1">
                        <p className="font-heading font-light text-foreground">
                          {image.name}:{image.tag}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatBytes(image.sizeBytes)} &middot; {image.license} &middot;{' '}
                          {new Date(image.pushedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2 rounded-lg border border-white/[0.12] bg-background/50 p-3">
                      <code className="flex-1 break-all text-sm text-foreground">
                        {pushCommand}
                      </code>
                      <CopyButton value={pushCommand} />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ))
      )}
    </div>
  )
}
