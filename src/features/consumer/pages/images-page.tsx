import { useMemo } from 'react'
import { ContainerIcon } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header.tsx'
import { Card, CardContent } from '@/components/ui/card.tsx'
import { EmptyState } from '@/components/shared/empty-state.tsx'
import { CopyButton } from '@/components/shared/copy-button.tsx'
import { useAuthStore } from '@/stores/auth-store.ts'
import { getDockerImagesForConsumer } from '@/mocks/handlers.ts'
import { ROUTES } from '@/lib/constants.ts'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function ImagesPage() {
  const { currentUser } = useAuthStore()
  const consumerId = currentUser?.id ?? ''

  const images = useMemo(
    () => getDockerImagesForConsumer(consumerId),
    [consumerId],
  )

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

      {images.length === 0 ? (
        <EmptyState
          icon={<ContainerIcon className="h-12 w-12" />}
          title="No Docker images available"
          description="Subscribe to Docker-type services to see available images here."
        />
      ) : (
        <div className="space-y-4">
          {images.map((image) => (
            <Card key={image.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 space-y-1">
                    <p className="font-heading font-light text-foreground">
                      {image.name}:{image.tag}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatBytes(image.sizeBytes)} &middot; {image.license}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 rounded-lg border border-white/[0.06] bg-background/50 p-3">
                  <code className="flex-1 break-all text-sm text-foreground">
                    {image.pullCommand}
                  </code>
                  <CopyButton value={image.pullCommand} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
