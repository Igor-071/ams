import { useMemo } from 'react'
import { Link } from 'react-router'
import {
  BoxIcon,
  KeyIcon,
  BarChart3Icon,
  DollarSignIcon,
  ArrowRightIcon,
  ClockIcon,
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
import { StatusBadge } from '@/components/shared/status-badge.tsx'
import { useAuthStore } from '@/stores/auth-store.ts'
import {
  getAccessRequestsByConsumer,
  getApiKeysByConsumer,
  getUsageRecords,
  getServiceById,
  getDailyUsageByConsumer,
  getConsumerApprovedServices,
} from '@/mocks/handlers.ts'
import { ROUTES } from '@/lib/constants.ts'

const activityChartConfig = {
  requestCount: {
    label: 'Requests',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig

const costChartConfig = {
  cost: {
    label: 'Cost',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig

const requestStatusChartConfig = {
  success: { label: 'Success', color: '#4ade80' },
  clientError: { label: 'Client Error', color: '#fbbf24' },
  serverError: { label: 'Server Error', color: '#f87171' },
} satisfies ChartConfig

const topServicesChartConfig = {
  requests: {
    label: 'Requests',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig

const STATUS_COLORS: Record<string, string> = {
  success: '#4ade80',
  clientError: '#fbbf24',
  serverError: '#f87171',
}

const STATUS_LABELS: Record<string, string> = {
  success: '2xx Success',
  clientError: '4xx Client Error',
  serverError: '5xx Server Error',
}

export function DashboardPage() {
  const { currentUser } = useAuthStore()
  const consumerId = currentUser?.id ?? ''

  const allRequests = useMemo(
    () => getAccessRequestsByConsumer(consumerId),
    [consumerId],
  )

  const pendingRequests = useMemo(
    () => allRequests.filter((r) => r.status === 'pending'),
    [allRequests],
  )

  const stats = useMemo(() => {
    const approvedRequests = allRequests.filter(
      (r) => r.status === 'approved',
    )
    const activeKeys = getApiKeysByConsumer(consumerId).data.filter(
      (k) => k.status === 'active',
    )
    const usage = getUsageRecords({ consumerId })
    const totalCost = usage.data.reduce((sum, u) => {
      const service = getServiceById(u.serviceId)
      const price = service?.pricing.pricePerRequest ?? 0
      return sum + price
    }, 0)

    return {
      activeServices: approvedRequests.length,
      activeApiKeys: activeKeys.length,
      totalRequests: usage.total,
      totalCost,
      pendingRequests: pendingRequests.length,
    }
  }, [consumerId, allRequests, pendingRequests])

  const recentActivity = useMemo(() => {
    const usage = getUsageRecords({ consumerId })
    return usage.data
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5)
      .map((u) => {
        const service = getServiceById(u.serviceId)
        return { ...u, serviceName: service?.name ?? 'Unknown' }
      })
  }, [consumerId])

  const last30Days = useMemo(
    () => getDailyUsageByConsumer(consumerId).slice(-30),
    [consumerId],
  )

  const requestStatusData = useMemo(() => {
    const usage = getUsageRecords({ consumerId, pageSize: 10000 })
    const counts: Record<string, number> = { success: 0, clientError: 0, serverError: 0 }
    for (const record of usage.data) {
      if (record.statusCode >= 200 && record.statusCode < 400) {
        counts.success += 1
      } else if (record.statusCode >= 400 && record.statusCode < 500) {
        counts.clientError += 1
      } else if (record.statusCode >= 500) {
        counts.serverError += 1
      }
    }
    return Object.entries(counts)
      .filter(([, value]) => value > 0)
      .map(([key, value]) => ({
        name: STATUS_LABELS[key] ?? key,
        value,
        color: STATUS_COLORS[key] ?? '#7B83A0',
        status: key,
      }))
  }, [consumerId])

  const topServices = useMemo(() => {
    const approved = getConsumerApprovedServices(consumerId)
    return approved
      .map((svc) => ({
        name: svc.name,
        requests: getUsageRecords({ consumerId, serviceId: svc.id }).total,
      }))
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 5)
  }, [consumerId])

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Overview of your API consumption" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active Services" value={stats.activeServices} icon={BoxIcon} />
        <StatCard label="Active API Keys" value={stats.activeApiKeys} icon={KeyIcon} />
        <StatCard label="Total Requests" value={stats.totalRequests} icon={BarChart3Icon} />
        <StatCard
          label="Total Cost"
          value={`$${stats.totalCost.toFixed(2)}`}
          icon={DollarSignIcon}
        />
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg font-light">
              Usage Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div data-testid="usage-activity-chart">
              <ChartContainer config={activityChartConfig} className="h-[250px] w-full">
                <AreaChart data={last30Days} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fillConsumerActivity" x1="0" y1="0" x2="0" y2="1">
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
                    fill="url(#fillConsumerActivity)"
                  />
                </AreaChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg font-light">
              Cost Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div data-testid="cost-trend-chart">
              <ChartContainer config={costChartConfig} className="h-[250px] w-full">
                <AreaChart data={last30Days} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fillConsumerCost" x1="0" y1="0" x2="0" y2="1">
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
                    fill="url(#fillConsumerCost)"
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
              Request Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div data-testid="request-status-chart">
              <ChartContainer config={requestStatusChartConfig} className="h-[250px] w-full">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={requestStatusData}
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
                    {requestStatusData.map((entry) => (
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

      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-heading text-lg font-light flex items-center gap-2">
              <ClockIcon className="h-5 w-5 text-amber-400" />
              Pending Requests
              <Badge
                variant="secondary"
                className="bg-amber-500/15 text-amber-400 text-xs ml-1"
              >
                {pendingRequests.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center justify-between rounded-lg border border-white/[0.12] p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {req.serviceName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Requested {new Date(req.requestedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="rounded-full"
                  >
                    <Link to={ROUTES.MARKETPLACE_SERVICE(req.serviceId)}>
                      View
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-heading text-lg font-light">
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between rounded-lg border border-white/[0.12] p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {entry.serviceName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(entry.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <StatusBadge
                      status={entry.statusCode < 400 ? 'active' : 'rejected'}
                      className={undefined}
                    />
                  </div>
                ))}
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
              <Link to={ROUTES.CONSUMER_API_KEYS}>
                API Keys
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-between rounded-full"
              asChild
            >
              <Link to={ROUTES.CONSUMER_USAGE}>
                Usage
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
