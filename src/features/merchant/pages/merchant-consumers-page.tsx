import { useMemo } from 'react'
import { PageHeader } from '@/components/shared/page-header.tsx'
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
import {
  getServicesByMerchant,
  getApiKeysForService,
  getUsageRecords,
} from '@/mocks/handlers.ts'
import { ROUTES } from '@/lib/constants.ts'

interface ConsumerKeyRow {
  apiKeyId: string
  keyName: string
  keyPrefix: string
  serviceName: string
  requestCount: number
  status: string
}

export function MerchantConsumersPage() {
  const { currentUser } = useAuthStore()
  const merchantId = currentUser?.id ?? ''

  const rows = useMemo(() => {
    const services = getServicesByMerchant(merchantId, { pageSize: 100 }).data
    const result: ConsumerKeyRow[] = []

    for (const service of services) {
      const keys = getApiKeysForService(service.id)
      for (const key of keys) {
        const usage = getUsageRecords({ serviceId: service.id, apiKeyId: key.id })
        result.push({
          apiKeyId: key.id,
          keyName: key.name,
          keyPrefix: key.keyPrefix,
          serviceName: service.name,
          requestCount: usage.total,
          status: key.status,
        })
      }
    }

    return result
  }, [merchantId])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Consumers"
        description="API key usage across your services"
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.MERCHANT_DASHBOARD },
          { label: 'Consumers' },
        ]}
      />

      <div className="rounded-2xl border border-white/[0.12]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Key Name</TableHead>
              <TableHead>Prefix</TableHead>
              <TableHead>Service</TableHead>
              <TableHead className="text-right">Requests</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No consumer activity yet
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={`${row.apiKeyId}-${row.serviceName}`}>
                  <TableCell className="font-medium">{row.keyName}</TableCell>
                  <TableCell>
                    <code className="text-xs text-muted-foreground">
                      {row.keyPrefix}...
                    </code>
                  </TableCell>
                  <TableCell>{row.serviceName}</TableCell>
                  <TableCell className="text-right">{row.requestCount}</TableCell>
                  <TableCell>
                    <StatusBadge status={row.status} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
