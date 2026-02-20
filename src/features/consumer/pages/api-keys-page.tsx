import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router'
import { KeyIcon, PlusIcon } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header.tsx'
import { Button } from '@/components/ui/button.tsx'
import { EmptyState } from '@/components/shared/empty-state.tsx'
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
import { getApiKeysByConsumer } from '@/mocks/handlers.ts'
import { ROUTES } from '@/lib/constants.ts'

export function ApiKeysPage() {
  const { currentUser } = useAuthStore()
  const navigate = useNavigate()
  const consumerId = currentUser?.id ?? ''

  const keys = useMemo(() => {
    return getApiKeysByConsumer(consumerId, { pageSize: 100 }).data
  }, [consumerId])

  return (
    <div className="space-y-6">
      <PageHeader
        title="API Keys"
        description="Manage your API keys"
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.CONSUMER_DASHBOARD },
          { label: 'API Keys' },
        ]}
        actions={
          <Button className="rounded-full" asChild>
            <Link to={ROUTES.CONSUMER_API_KEY_NEW}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Generate New Key
            </Link>
          </Button>
        }
      />

      {keys.length === 0 ? (
        <EmptyState
          icon={<KeyIcon className="h-12 w-12" />}
          title="No API keys yet"
          description="Generate your first API key to start consuming services."
          action={
            <Button className="rounded-full" asChild>
              <Link to={ROUTES.CONSUMER_API_KEY_NEW}>Generate New Key</Link>
            </Button>
          }
        />
      ) : (
        <div className="rounded-2xl border border-white/[0.12]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Prefix</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Services</TableHead>
                <TableHead>Expires</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys.map((key) => (
                <TableRow
                  key={key.id}
                  className="cursor-pointer"
                  onClick={() => navigate(ROUTES.CONSUMER_API_KEY_DETAIL(key.id))}
                >
                  <TableCell className="font-medium">{key.name}</TableCell>
                  <TableCell>
                    <code className="text-xs text-muted-foreground">
                      {key.keyPrefix}...
                    </code>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={key.status} />
                  </TableCell>
                  <TableCell>{key.serviceIds.length}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(key.expiresAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
