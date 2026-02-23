import { useMemo } from 'react'
import { Link } from 'react-router'
import {
  BuildingIcon,
  UsersIcon,
  ClockIcon,
  BoxIcon,
  ArrowRightIcon,
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
import {
  getUsers,
  getServices,
  getAccessRequests,
  getDailyUsage,
  getUsageRecords,
  getServiceById,
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

const merchantChartConfig = {
  requests: {
    label: 'Requests',
    color: 'var(--chart-2)',
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

export function AdminDashboardPage() {
  const stats = useMemo(() => {
    const allUsers = getUsers({ pageSize: 1000 }).data
    const merchants = allUsers.filter((u) => u.roles.includes('merchant'))
    const consumers = allUsers.filter((u) => u.roles.includes('consumer'))
    const allServices = getServices({ pageSize: 1000 }).data
    const activeServices = allServices.filter((s) => s.status === 'active')
    const pendingServices = allServices.filter((s) => s.status === 'pending_approval')
    const pendingAccessRequests = getAccessRequests({ status: 'pending', pageSize: 1000 }).data
    return {
      totalMerchants: merchants.length,
      totalConsumers: consumers.length,
      pendingApprovals: pendingServices.length + pendingAccessRequests.length,
      activeServices: activeServices.length,
      pendingServices,
      pendingAccessRequests,
      allServices,
    }
  }, [])

  const last30Days = useMemo(() => {
    const daily = getDailyUsage()
    return daily.slice(-30)
  }, [])

  const serviceStatusData = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const svc of stats.allServices) {
      counts[svc.status] = (counts[svc.status] ?? 0) + 1
    }
    return Object.entries(counts).map(([status, value]) => ({
      name: STATUS_LABELS[status] ?? status,
      value,
      color: STATUS_COLORS[status] ?? '#7B83A0',
      status,
    }))
  }, [stats.allServices])

  const topMerchants = useMemo(() => {
    const allRecords = getUsageRecords({ pageSize: 10000 }).data
    const merchantCounts: Record<string, { name: string; requests: number }> = {}
    for (const record of allRecords) {
      const service = getServiceById(record.serviceId)
      if (!service) continue
      const key = service.merchantId
      if (!merchantCounts[key]) {
        merchantCounts[key] = { name: service.merchantName, requests: 0 }
      }
      merchantCounts[key].requests += 1
    }
    return Object.values(merchantCounts)
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 5)
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader title="Admin Dashboard" description="Platform overview and management" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Merchants" value={stats.totalMerchants} icon={BuildingIcon} />
        <StatCard label="Total Consumers" value={stats.totalConsumers} icon={UsersIcon} />
        <StatCard label="Pending Approvals" value={stats.pendingApprovals} icon={ClockIcon} />
        <StatCard label="Active Services" value={stats.activeServices} icon={BoxIcon} />
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg font-light">
              Platform Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div data-testid="platform-activity-chart">
              <ChartContainer config={activityChartConfig} className="h-[250px] w-full">
                <AreaChart data={last30Days} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fillActivity" x1="0" y1="0" x2="0" y2="1">
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
                    fill="url(#fillActivity)"
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
                    <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
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
                    fill="url(#fillRevenue)"
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
              Top Merchants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div data-testid="top-merchants-chart">
              <ChartContainer config={merchantChartConfig} className="h-[250px] w-full">
                <BarChart
                  data={topMerchants}
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
                    width={100}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="requests" fill="var(--chart-2)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg font-light">
            Pending Items
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {stats.pendingServices.length === 0 && stats.pendingAccessRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending items</p>
          ) : (
            <>
              {stats.pendingServices.map((svc) => (
                <Link
                  key={svc.id}
                  to={ROUTES.ADMIN_SERVICE_DETAIL(svc.id)}
                  className="flex items-center justify-between rounded-lg border border-white/[0.12] p-3 transition-colors hover:bg-white/[0.03]"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{svc.name}</p>
                    <p className="text-xs text-muted-foreground">by {svc.merchantName}</p>
                  </div>
                  <Badge variant="secondary" className="bg-amber-500/15 text-amber-400 text-xs">
                    Service Approval
                  </Badge>
                </Link>
              ))}
              {stats.pendingAccessRequests.map((req) => (
                <Link
                  key={req.id}
                  to={ROUTES.ADMIN_CONSUMER_DETAIL(req.consumerId)}
                  className="flex items-center justify-between rounded-lg border border-white/[0.12] p-3 transition-colors hover:bg-white/[0.03]"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{req.serviceName}</p>
                    <p className="text-xs text-muted-foreground">by {req.consumerName}</p>
                  </div>
                  <Badge variant="secondary" className="bg-blue-500/15 text-blue-400 text-xs">
                    Access Request
                  </Badge>
                </Link>
              ))}
            </>
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
          {[
            { label: 'Merchants', href: ROUTES.ADMIN_MERCHANTS },
            { label: 'Consumers', href: ROUTES.ADMIN_CONSUMERS },
            { label: 'Services', href: ROUTES.ADMIN_SERVICES },
            { label: 'Governance', href: ROUTES.ADMIN_GOVERNANCE },
          ].map((action) => (
            <Button
              key={action.label}
              variant="outline"
              className="w-full justify-between rounded-full"
              asChild
            >
              <Link to={action.href}>
                {action.label}
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
