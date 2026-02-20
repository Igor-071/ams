import { useMemo } from 'react'
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
import { getDailyUsage, getUsageRecords, getServiceById } from '@/mocks/handlers.ts'
import { ROUTES } from '@/lib/constants.ts'

export function UsagePage() {
  const { currentUser } = useAuthStore()
  const consumerId = currentUser?.id ?? ''

  const dailyUsage = useMemo(() => {
    return getDailyUsage().sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )
  }, [])

  const summaryStats = useMemo(() => {
    const totalRequests = dailyUsage.reduce((sum, d) => sum + d.requestCount, 0)
    const totalCost = dailyUsage.reduce((sum, d) => sum + d.cost, 0)
    const totalErrors = dailyUsage.reduce((sum, d) => sum + d.errorCount, 0)
    const errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0

    const usageRecords = getUsageRecords({ consumerId }).data
    const avgResponseTime =
      usageRecords.length > 0
        ? usageRecords.reduce((sum, u) => sum + u.responseTimeMs, 0) /
          usageRecords.length
        : 0

    return { totalRequests, totalCost, avgResponseTime, errorRate }
  }, [consumerId, dailyUsage])

  const byService = useMemo(() => {
    const usageRecords = getUsageRecords({ consumerId }).data
    const serviceMap = new Map<string, { name: string; requestCount: number; totalCost: number }>()

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
  }, [consumerId])

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
          value={`${Math.round(summaryStats.avgResponseTime)}ms`}
          icon={ClockIcon}
        />
        <StatCard
          label="Error Rate"
          value={`${summaryStats.errorRate.toFixed(1)}%`}
          icon={AlertCircleIcon}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg font-light">
            Daily Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-white/[0.06]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Requests</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Errors</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dailyUsage.map((day) => (
                  <TableRow key={day.date}>
                    <TableCell>{day.date}</TableCell>
                    <TableCell className="text-right">
                      {day.requestCount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      ${day.cost.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      {day.errorCount}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
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
            <div className="rounded-2xl border border-white/[0.06]">
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
