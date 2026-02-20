import { useMemo } from 'react'
import { Link } from 'react-router'
import {
  BoxIcon,
  UsersIcon,
  BarChart3Icon,
  DollarSignIcon,
  ArrowRightIcon,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header.tsx'
import { StatCard } from '@/components/shared/stat-card.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { Button } from '@/components/ui/button.tsx'
import { useAuthStore } from '@/stores/auth-store.ts'
import {
  getServicesByMerchant,
  getInvoicesByMerchant,
  getUsageRecords,
} from '@/mocks/handlers.ts'
import { mockAccessRequests } from '@/mocks/data/services.ts'
import { ROUTES } from '@/lib/constants.ts'

export function MerchantDashboardPage() {
  const { currentUser } = useAuthStore()
  const merchantId = currentUser?.id ?? ''

  const stats = useMemo(() => {
    const services = getServicesByMerchant(merchantId).data
    const serviceIds = services.map((s) => s.id)

    const activeConsumers = new Set(
      mockAccessRequests
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
  }, [merchantId])

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
