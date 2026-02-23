import { useMemo } from 'react'
import { useNavigate } from 'react-router'
import {
  BarChart3Icon,
  DollarSignIcon,
  ClockIcon,
  AlertCircleIcon,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header.tsx'
import { StatCard } from '@/components/shared/stat-card.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
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
  getDailyUsage,
  getUsageRecords,
  getServiceById,
  getApiKeysByConsumer,
} from '@/mocks/handlers.ts'
import { ROUTES } from '@/lib/constants.ts'
import { ConsumptionChart } from '@/features/merchant/components/consumption-chart.tsx'

export function UsagePage() {
  const navigate = useNavigate()
  const { currentUser } = useAuthStore()
  const consumerId = currentUser?.id ?? ''

  const dailyUsage = useMemo(() => getDailyUsage(), [])

  const usageRecords = useMemo(
    () => getUsageRecords({ consumerId }).data,
    [consumerId],
  )

  const summaryStats = useMemo(() => {
    const totalRequests = usageRecords.length
    const totalCost = usageRecords.reduce((sum, r) => {
      const svc = getServiceById(r.serviceId)
      return sum + (svc?.pricing.pricePerRequest ?? 0)
    }, 0)
    const avgResponseTime =
      totalRequests > 0
        ? Math.round(
            usageRecords.reduce((sum, r) => sum + r.responseTimeMs, 0) /
              totalRequests,
          )
        : 0
    const errorCount = usageRecords.filter((r) => r.statusCode >= 400).length
    const errorRate =
      totalRequests > 0 ? (errorCount / totalRequests) * 100 : 0

    return { totalRequests, totalCost, avgResponseTime, errorRate }
  }, [usageRecords])

  const byApiKey = useMemo(() => {
    const keys = getApiKeysByConsumer(consumerId, { pageSize: 100 }).data
    return keys.map((key) => {
      const keyUsage = usageRecords.filter((r) => r.apiKeyId === key.id)
      const revenue = keyUsage.reduce((sum, r) => {
        const svc = getServiceById(r.serviceId)
        return sum + (svc?.pricing.pricePerRequest ?? 0)
      }, 0)
      return {
        id: key.id,
        keyName: key.name,
        keyPrefix: key.keyPrefix,
        requests: keyUsage.length,
        cost: revenue,
        status: key.status,
      }
    })
  }, [consumerId, usageRecords])

  const byService = useMemo(() => {
    const serviceMap = new Map<
      string,
      { name: string; requestCount: number; totalCost: number }
    >()

    for (const record of usageRecords) {
      const existing = serviceMap.get(record.serviceId)
      const service = getServiceById(record.serviceId)
      const price = service?.pricing.pricePerRequest ?? 0

      if (existing) {
        existing.requestCount++
        existing.totalCost += price
      } else {
        serviceMap.set(record.serviceId, {
          name: service?.name ?? 'Unknown',
          requestCount: 1,
          totalCost: price,
        })
      }
    }

    return Array.from(serviceMap.entries()).map(([serviceId, data]) => ({
      serviceId,
      ...data,
    }))
  }, [usageRecords])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usage"
        description="Monitor your API consumption and costs"
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.CONSUMER_DASHBOARD },
          { label: 'Usage' },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Requests"
          value={summaryStats.totalRequests.toLocaleString()}
          icon={BarChart3Icon}
        />
        <StatCard
          label="Total Cost"
          value={`$${summaryStats.totalCost.toFixed(2)}`}
          icon={DollarSignIcon}
        />
        <StatCard
          label="Avg Response Time"
          value={`${summaryStats.avgResponseTime}ms`}
          icon={ClockIcon}
        />
        <StatCard
          label="Error Rate"
          value={`${summaryStats.errorRate.toFixed(1)}%`}
          icon={AlertCircleIcon}
        />
      </div>

      <ConsumptionChart
        dailyUsage={dailyUsage}
        onDateClick={(date) => navigate(ROUTES.CONSUMER_USAGE_DETAIL(date))}
      />

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg font-light">
            By API Key
          </CardTitle>
        </CardHeader>
        <CardContent>
          {byApiKey.length === 0 ? (
            <p className="text-sm text-muted-foreground">No usage data</p>
          ) : (
            <div className="rounded-2xl border border-white/[0.12]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Key Name</TableHead>
                    <TableHead>Key Prefix</TableHead>
                    <TableHead className="text-right">Requests</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {byApiKey.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">
                        {row.keyName}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {row.keyPrefix}
                      </TableCell>
                      <TableCell className="text-right">
                        {row.requests}
                      </TableCell>
                      <TableCell className="text-right">
                        ${row.cost.toFixed(3)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            row.status === 'active'
                              ? 'bg-green-500/15 text-green-400'
                              : row.status === 'expired'
                                ? 'bg-yellow-500/15 text-yellow-400'
                                : 'bg-red-500/15 text-red-400'
                          }`}
                        >
                          {row.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg font-light">
            By Service
          </CardTitle>
        </CardHeader>
        <CardContent>
          {byService.length === 0 ? (
            <p className="text-sm text-muted-foreground">No usage data</p>
          ) : (
            <div className="rounded-2xl border border-white/[0.12]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead className="text-right">Requests</TableHead>
                    <TableHead className="text-right">Total Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {byService.map((entry) => (
                    <TableRow key={entry.serviceId}>
                      <TableCell className="font-medium">{entry.name}</TableCell>
                      <TableCell className="text-right">
                        {entry.requestCount}
                      </TableCell>
                      <TableCell className="text-right">
                        ${entry.totalCost.toFixed(3)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
