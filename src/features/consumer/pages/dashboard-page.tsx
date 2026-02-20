import { useMemo } from 'react'
import { Link } from 'react-router'
import {
  BoxIcon,
  KeyIcon,
  BarChart3Icon,
  DollarSignIcon,
  ArrowRightIcon,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header.tsx'
import { StatCard } from '@/components/shared/stat-card.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { Button } from '@/components/ui/button.tsx'
import { StatusBadge } from '@/components/shared/status-badge.tsx'
import { useAuthStore } from '@/stores/auth-store.ts'
import { getAccessRequestsByConsumer, getApiKeysByConsumer, getUsageRecords } from '@/mocks/handlers.ts'
import { getServiceById } from '@/mocks/handlers.ts'
import { ROUTES } from '@/lib/constants.ts'

export function DashboardPage() {
  const { currentUser } = useAuthStore()
  const consumerId = currentUser?.id ?? ''

  const stats = useMemo(() => {
    const approvedRequests = getAccessRequestsByConsumer(consumerId).filter(
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
    }
  }, [consumerId])

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
                    className="flex items-center justify-between rounded-lg border border-white/[0.06] p-3"
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
