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
import { PageHeader } from '@/components/shared/page-header.tsx'
import { StatCard } from '@/components/shared/stat-card.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { Button } from '@/components/ui/button.tsx'
import { useAuthStore } from '@/stores/auth-store.ts'
import {
  getServicesByMerchant,
  getInvoicesByMerchant,
  getUsageRecords,
  getAccessRequestsByMerchant,
} from '@/mocks/handlers.ts'
import { ROUTES } from '@/lib/constants.ts'

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

  const stats = useMemo(() => {
    const services = getServicesByMerchant(merchantId).data
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
  }, [merchantId, accessRequests])

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
