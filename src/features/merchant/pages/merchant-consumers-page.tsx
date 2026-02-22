import { useMemo } from 'react'
import { PageHeader } from '@/components/shared/page-header.tsx'
import { StatusBadge } from '@/components/shared/status-badge.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { Badge } from '@/components/ui/badge.tsx'
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
  getAccessRequestsByMerchant,
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

  const pendingAccessRequests = useMemo(() => {
    return getAccessRequestsByMerchant(merchantId).filter(
      (r) => r.status === 'pending',
    )
  }, [merchantId])

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

      {pendingAccessRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg font-light flex items-center gap-2">
              Pending Access Requests
              <Badge
                variant="secondary"
                className="bg-amber-500/15 text-amber-400 text-xs ml-1"
              >
                {pendingAccessRequests.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.12] text-left text-muted-foreground">
                    <th className="pb-3 font-medium">Consumer</th>
                    <th className="pb-3 font-medium">Service</th>
                    <th className="pb-3 font-medium">Requested</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingAccessRequests.map((req) => (
                    <tr
                      key={req.id}
                      className="border-b border-white/[0.12] last:border-0"
                    >
                      <td className="py-3 font-medium text-foreground">
                        {req.consumerName}
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {req.serviceName}
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {new Date(req.requestedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3">
                        <Badge
                          variant="secondary"
                          className="bg-amber-500/15 text-amber-400 text-xs"
                        >
                          Pending
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

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
