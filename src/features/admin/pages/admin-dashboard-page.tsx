import { useMemo } from 'react'
import { Link } from 'react-router'
import {
  BuildingIcon,
  UsersIcon,
  ClockIcon,
  BoxIcon,
  ArrowRightIcon,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header.tsx'
import { StatCard } from '@/components/shared/stat-card.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { Button } from '@/components/ui/button.tsx'
import {
  getUsers,
  getServices,
  getAccessRequests,
} from '@/mocks/handlers.ts'
import { ROUTES } from '@/lib/constants.ts'

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
    }
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
                  className="flex items-center justify-between rounded-lg border border-white/[0.06] p-3 transition-colors hover:bg-white/[0.03]"
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
                  className="flex items-center justify-between rounded-lg border border-white/[0.06] p-3 transition-colors hover:bg-white/[0.03]"
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
