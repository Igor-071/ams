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
import {
  getUsageRecords,
  getServiceById,
  getUserById,
  getMerchantProfile,
  getConsumerProfile,
  getDailyUsage,
} from '@/mocks/handlers.ts'
import { ROUTES } from '@/lib/constants.ts'
import { ConsumptionChart } from '@/features/merchant/components/consumption-chart.tsx'

export function AdminUsagePage() {
  const navigate = useNavigate()

  const allRecords = useMemo(
    () => getUsageRecords({ pageSize: 10000 }).data,
    [],
  )

  const stats = useMemo(() => {
    const totalRequests = allRecords.length
    const totalRevenue = allRecords.reduce((sum, r) => {
      const svc = getServiceById(r.serviceId)
      return sum + (svc?.pricing.pricePerRequest ?? 0)
    }, 0)
    const avgResponseTime =
      totalRequests > 0
        ? Math.round(
            allRecords.reduce((sum, r) => sum + r.responseTimeMs, 0) /
              totalRequests,
          )
        : 0
    const errorCount = allRecords.filter((r) => r.statusCode >= 400).length
    const errorRate =
      totalRequests > 0 ? (errorCount / totalRequests) * 100 : 0

    return { totalRequests, totalRevenue, avgResponseTime, errorRate }
  }, [allRecords])

  const dailyUsage = useMemo(() => getDailyUsage(), [])

  const byMerchant = useMemo(() => {
    const map = new Map<
      string,
      { merchantId: string; name: string; company: string; requests: number; revenue: number; status: string }
    >()

    for (const record of allRecords) {
      const svc = getServiceById(record.serviceId)
      if (!svc) continue
      const existing = map.get(svc.merchantId)
      const revenue = svc.pricing.pricePerRequest ?? 0

      if (existing) {
        existing.requests += 1
        existing.revenue += revenue
      } else {
        const user = getUserById(svc.merchantId)
        const profile = getMerchantProfile(svc.merchantId)
        map.set(svc.merchantId, {
          merchantId: svc.merchantId,
          name: user?.name ?? 'Unknown',
          company: profile?.companyName ?? 'Unknown',
          requests: 1,
          revenue,
          status: user?.status ?? 'unknown',
        })
      }
    }

    return Array.from(map.values())
  }, [allRecords])

  const byConsumer = useMemo(() => {
    const map = new Map<
      string,
      { consumerId: string; name: string; organization: string; requests: number; cost: number; status: string }
    >()

    for (const record of allRecords) {
      const svc = getServiceById(record.serviceId)
      const cost = svc?.pricing.pricePerRequest ?? 0
      const existing = map.get(record.consumerId)

      if (existing) {
        existing.requests += 1
        existing.cost += cost
      } else {
        const user = getUserById(record.consumerId)
        const profile = getConsumerProfile(record.consumerId)
        map.set(record.consumerId, {
          consumerId: record.consumerId,
          name: user?.name ?? 'Unknown',
          organization: profile?.organization ?? 'N/A',
          requests: 1,
          cost,
          status: user?.status ?? 'unknown',
        })
      }
    }

    return Array.from(map.values())
  }, [allRecords])

  const byService = useMemo(() => {
    const map = new Map<
      string,
      { serviceId: string; name: string; merchantName: string; type: string; requests: number; revenue: number }
    >()

    for (const record of allRecords) {
      const svc = getServiceById(record.serviceId)
      const revenue = svc?.pricing.pricePerRequest ?? 0
      const existing = map.get(record.serviceId)

      if (existing) {
        existing.requests += 1
        existing.revenue += revenue
      } else {
        map.set(record.serviceId, {
          serviceId: record.serviceId,
          name: svc?.name ?? 'Unknown',
          merchantName: svc?.merchantName ?? 'Unknown',
          type: svc?.type ?? 'api',
          requests: 1,
          revenue,
        })
      }
    }

    return Array.from(map.values())
  }, [allRecords])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Usage"
        description="Platform-wide usage analytics and metrics"
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.ADMIN_DASHBOARD },
          { label: 'Usage' },
        ]}
      />

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Requests"
          value={stats.totalRequests.toLocaleString()}
          icon={BarChart3Icon}
        />
        <StatCard
          label="Total Revenue"
          value={`$${stats.totalRevenue.toFixed(3)}`}
          icon={DollarSignIcon}
        />
        <StatCard
          label="Avg Response Time"
          value={`${stats.avgResponseTime}ms`}
          icon={ClockIcon}
        />
        <StatCard
          label="Error Rate"
          value={`${stats.errorRate.toFixed(1)}%`}
          icon={AlertCircleIcon}
        />
      </div>

      {/* Consumption chart */}
      <ConsumptionChart
        dailyUsage={dailyUsage}
        onDateClick={(date) => navigate(ROUTES.ADMIN_USAGE_DETAIL(date))}
      />

      {/* By Merchant table */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg font-light">
            By Merchant
          </CardTitle>
        </CardHeader>
        <CardContent>
          {byMerchant.length === 0 ? (
            <p className="text-sm text-muted-foreground">No usage data</p>
          ) : (
            <div className="rounded-2xl border border-white/[0.12]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead className="text-right">Requests</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {byMerchant.map((row) => (
                    <TableRow key={row.merchantId}>
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell>{row.company}</TableCell>
                      <TableCell className="text-right">{row.requests}</TableCell>
                      <TableCell className="text-right">
                        ${row.revenue.toFixed(3)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            row.status === 'active'
                              ? 'bg-green-500/15 text-green-400'
                              : row.status === 'suspended'
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

      {/* By Consumer table */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg font-light">
            By Consumer
          </CardTitle>
        </CardHeader>
        <CardContent>
          {byConsumer.length === 0 ? (
            <p className="text-sm text-muted-foreground">No usage data</p>
          ) : (
            <div className="rounded-2xl border border-white/[0.12]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead className="text-right">Requests</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {byConsumer.map((row) => (
                    <TableRow key={row.consumerId}>
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell>{row.organization}</TableCell>
                      <TableCell className="text-right">{row.requests}</TableCell>
                      <TableCell className="text-right">
                        ${row.cost.toFixed(3)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            row.status === 'active'
                              ? 'bg-green-500/15 text-green-400'
                              : row.status === 'blocked'
                                ? 'bg-red-500/15 text-red-400'
                                : 'bg-yellow-500/15 text-yellow-400'
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

      {/* By Service table */}
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
                    <TableHead>Service Name</TableHead>
                    <TableHead>Merchant</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Requests</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {byService.map((row) => (
                    <TableRow key={row.serviceId}>
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell>{row.merchantName}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full bg-blue-500/15 px-2 py-0.5 text-xs font-medium text-blue-400">
                          {row.type === 'docker' ? 'Docker' : 'API'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{row.requests}</TableCell>
                      <TableCell className="text-right">
                        ${row.revenue.toFixed(3)}
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
