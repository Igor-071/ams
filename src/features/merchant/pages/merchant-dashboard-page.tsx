import { useMemo } from 'react'
import { Link } from 'react-router'
import {
  BoxIcon,
  UsersIcon,
  BarChart3Icon,
  DollarSignIcon,
  ArrowRightIcon,
  InboxIcon,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts'
import { PageHeader } from '@/components/shared/page-header.tsx'
import { StatCard } from '@/components/shared/stat-card.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { Button } from '@/components/ui/button.tsx'
import { useAuthStore } from '@/stores/auth-store.ts'
import {
  getServicesByMerchant,
  getInvoicesByMerchant,
  getUsageRecords,
  getAccessRequestsByMerchant,
  getDailyUsageByMerchant,
} from '@/mocks/handlers.ts'
import { ROUTES } from '@/lib/constants.ts'

const activityChartConfig = {
  requestCount: {
    label: 'Requests',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig

const revenueChartConfig = {
  cost: {
    label: 'Revenue',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig

const statusChartConfig = {
  active: { label: 'Active', color: '#4ade80' },
  pending_approval: { label: 'Pending', color: '#fbbf24' },
  draft: { label: 'Draft', color: '#60a5fa' },
  suspended: { label: 'Suspended', color: '#f87171' },
} satisfies ChartConfig

const topServicesChartConfig = {
  requests: {
    label: 'Requests',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig

const STATUS_COLORS: Record<string, string> = {
  active: '#4ade80',
  pending_approval: '#fbbf24',
  draft: '#60a5fa',
  suspended: '#f87171',
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  pending_approval: 'Pending',
  draft: 'Draft',
  suspended: 'Suspended',
}

export function MerchantDashboardPage() {
  const { currentUser } = useAuthStore()
  const merchantId = currentUser?.id ?? ''

  const accessRequests = useMemo(
    () => getAccessRequestsByMerchant(merchantId),
    [merchantId],
  )

  const pendingAccessRequests = useMemo(
    () => accessRequests.filter((r) => r.status === 'pending'),
    [accessRequests],
  )

  const recentlyResolved = useMemo(
    () =>
      accessRequests
        .filter((r) => r.status === 'approved' || r.status === 'denied')
        .sort(
          (a, b) =>
            new Date(b.resolvedAt ?? b.requestedAt).getTime() -
            new Date(a.resolvedAt ?? a.requestedAt).getTime(),
        )
        .slice(0, 5),
    [accessRequests],
  )

  const merchantServices = useMemo(
    () => getServicesByMerchant(merchantId, { pageSize: 1000 }).data,
    [merchantId],
  )

  const stats = useMemo(() => {
    const services = merchantServices
    const serviceIds = services.map((s) => s.id)

    const activeConsumers = new Set(
      accessRequests
        .filter((r) => serviceIds.includes(r.serviceId) && r.status === 'approved')
        .map((r) => r.consumerId),
    ).size

    const totalRequests = serviceIds.reduce((sum, svcId) => {
      return sum + getUsageRecords({ serviceId: svcId }).total
    }, 0)

    const invoices = getInvoicesByMerchant(merchantId).data
    const revenue = invoices.reduce((sum, inv) => sum + inv.total, 0)

    return {
      totalServices: services.length,
      activeConsumers,
      totalRequests,
      revenue,
    }
  }, [merchantId, accessRequests, merchantServices])

  const last30Days = useMemo(
    () => getDailyUsageByMerchant(merchantId).slice(-30),
    [merchantId],
  )

  const serviceStatusData = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const svc of merchantServices) {
      counts[svc.status] = (counts[svc.status] ?? 0) + 1
    }
    return Object.entries(counts).map(([status, value]) => ({
      name: STATUS_LABELS[status] ?? status,
      value,
      color: STATUS_COLORS[status] ?? '#7B83A0',
      status,
    }))
  }, [merchantServices])

  const topServices = useMemo(() => {
    return merchantServices
      .map((svc) => ({
        name: svc.name,
        requests: getUsageRecords({ serviceId: svc.id }).total,
      }))
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 5)
  }, [merchantServices])

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Overview of your merchant activity" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Services" value={stats.totalServices} icon={BoxIcon} />
        <StatCard label="Active Consumers" value={stats.activeConsumers} icon={UsersIcon} />
        <StatCard label="Total Requests" value={stats.totalRequests} icon={BarChart3Icon} />
        <StatCard
          label="Revenue"
          value={`$${stats.revenue.toFixed(2)}`}
          icon={DollarSignIcon}
        />
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg font-light">
              Service Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div data-testid="service-activity-chart">
              <ChartContainer config={activityChartConfig} className="h-[250px] w-full">
                <AreaChart data={last30Days} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fillMerchantActivity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value: string) => format(parseISO(value), 'MMM d')}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    width={45}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="requestCount"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    fill="url(#fillMerchantActivity)"
                  />
                </AreaChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg font-light">
              Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div data-testid="revenue-trend-chart">
              <ChartContainer config={revenueChartConfig} className="h-[250px] w-full">
                <AreaChart data={last30Days} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fillMerchantRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value: string) => format(parseISO(value), 'MMM d')}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tickFormatter={(value: number) => `$${value}`}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    width={55}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => `$${(value as number).toFixed(2)}`}
                      />
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="cost"
                    stroke="var(--chart-2)"
                    strokeWidth={2}
                    fill="url(#fillMerchantRevenue)"
                  />
                </AreaChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg font-light">
              Service Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div data-testid="service-status-chart">
              <ChartContainer config={statusChartConfig} className="h-[250px] w-full">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={serviceStatusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    label={({ name, value }: { name: string; value: number }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {serviceStatusData.map((entry) => (
                      <Cell key={entry.status} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg font-light">
              Top Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div data-testid="top-services-chart">
              <ChartContainer config={topServicesChartConfig} className="h-[250px] w-full">
                <BarChart
                  data={topServices}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    width={120}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="requests" fill="var(--chart-1)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg font-light flex items-center gap-2">
            <InboxIcon className="h-5 w-5 text-amber-400" />
            Access Requests
            {pendingAccessRequests.length > 0 && (
              <Badge
                variant="secondary"
                className="bg-amber-500/15 text-amber-400 text-xs ml-1"
              >
                {pendingAccessRequests.length} pending
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingAccessRequests.length === 0 && recentlyResolved.length === 0 ? (
            <p className="text-sm text-muted-foreground">No access requests</p>
          ) : (
            <div className="space-y-4">
              {pendingAccessRequests.length > 0 && (
                <div className="space-y-3">
                  {pendingAccessRequests.map((req) => (
                    <div
                      key={req.id}
                      className="flex items-center justify-between rounded-lg border border-white/[0.12] p-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {req.consumerName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {req.serviceName} &middot; Requested{' '}
                          {new Date(req.requestedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-amber-500/15 text-amber-400 text-xs"
                      >
                        Pending
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              {recentlyResolved.length > 0 && (
                <>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Recently Resolved
                  </p>
                  <div className="space-y-3">
                    {recentlyResolved.map((req) => (
                      <div
                        key={req.id}
                        className="flex items-center justify-between rounded-lg border border-white/[0.12] p-3"
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {req.consumerName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {req.serviceName}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className={
                            req.status === 'approved'
                              ? 'bg-emerald-500/15 text-emerald-400 text-xs'
                              : 'bg-red-500/15 text-red-400 text-xs'
                          }
                        >
                          {req.status === 'approved' ? 'Approved' : 'Denied'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg font-light">
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-between rounded-full"
            asChild
          >
            <Link to={ROUTES.MERCHANT_SERVICES}>
              Services
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="outline"
            className="w-full justify-between rounded-full"
            asChild
          >
            <Link to={ROUTES.MERCHANT_INVOICES}>
              Invoices
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
