import { useMemo } from 'react'
import { useParams } from 'react-router'
import { PageHeader } from '@/components/shared/page-header.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { StatCard } from '@/components/shared/stat-card.tsx'
import { StatusBadge } from '@/components/shared/status-badge.tsx'
import { BarChart3Icon, ClockIcon } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store.ts'
import { getServiceById, getConsumerServiceUsage } from '@/mocks/handlers.ts'
import { ROUTES } from '@/lib/constants.ts'

export function ConsumerServiceDetailPage() {
  const { serviceId } = useParams<{ serviceId: string }>()
  const { currentUser } = useAuthStore()
  const consumerId = currentUser?.id ?? ''

  const service = useMemo(() => getServiceById(serviceId ?? ''), [serviceId])
  const usage = useMemo(
    () => getConsumerServiceUsage(consumerId, serviceId ?? ''),
    [consumerId, serviceId],
  )

  if (!service) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Service Not Found"
          breadcrumbs={[
            { label: 'Dashboard', href: ROUTES.CONSUMER_DASHBOARD },
            { label: 'Services', href: ROUTES.CONSUMER_SERVICES },
            { label: 'Not Found' },
          ]}
        />
        <p className="text-muted-foreground">This service does not exist.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={service.name}
        description={service.description}
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.CONSUMER_DASHBOARD },
          { label: 'Services', href: ROUTES.CONSUMER_SERVICES },
          { label: service.name },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Merchant</p>
            <p className="text-lg font-medium text-foreground">{service.merchantName}</p>
          </CardContent>
        </Card>
        <StatCard
          label="Total Requests"
          value={usage.totalRequests}
          icon={BarChart3Icon}
        />
        <StatCard
          label="Avg Response Time"
          value={`${usage.avgResponseTimeMs}ms`}
          icon={ClockIcon}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg font-light">
            Recent Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          {usage.records.length === 0 ? (
            <p className="text-sm text-muted-foreground">No usage records yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.12] text-left text-muted-foreground">
                    <th className="pb-3 font-medium">Timestamp</th>
                    <th className="pb-3 font-medium">Response Time</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {usage.records.map((record) => (
                    <tr
                      key={record.id}
                      className="border-b border-white/[0.12] last:border-0"
                    >
                      <td className="py-3 text-foreground">
                        {new Date(record.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {record.responseTimeMs}ms
                      </td>
                      <td className="py-3">
                        <StatusBadge
                          status={record.statusCode < 400 ? 'active' : 'rejected'}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
