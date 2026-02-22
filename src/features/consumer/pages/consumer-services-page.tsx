import { useMemo } from 'react'
import { Link } from 'react-router'
import { ClockIcon } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { Button } from '@/components/ui/button.tsx'
import { useAuthStore } from '@/stores/auth-store.ts'
import { getConsumerApprovedServices, getAccessRequestsByConsumer } from '@/mocks/handlers.ts'
import { ROUTES } from '@/lib/constants.ts'

export function ConsumerServicesPage() {
  const { currentUser } = useAuthStore()
  const consumerId = currentUser?.id ?? ''

  const services = useMemo(
    () => getConsumerApprovedServices(consumerId),
    [consumerId],
  )

  const { pendingRequests, deniedRequests } = useMemo(() => {
    const allRequests = getAccessRequestsByConsumer(consumerId)
    return {
      pendingRequests: allRequests.filter((r) => r.status === 'pending'),
      deniedRequests: allRequests.filter((r) => r.status === 'denied'),
    }
  }, [consumerId])

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Services"
        description="Services you have approved access to"
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.CONSUMER_DASHBOARD },
          { label: 'Services' },
        ]}
      />

      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg font-light flex items-center gap-2">
              <ClockIcon className="h-5 w-5 text-amber-400" />
              Pending Requests
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
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="bg-amber-500/15 text-amber-400 text-xs"
                    >
                      Pending
                    </Badge>
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
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {deniedRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg font-light">
              Denied Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {deniedRequests.map((req) => (
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
                  <Badge
                    variant="secondary"
                    className="bg-red-500/15 text-red-400 text-xs"
                  >
                    Denied
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {services.length === 0 && pendingRequests.length === 0 && deniedRequests.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              You don't have access to any services yet.
            </p>
            <Button asChild className="mt-4 rounded-full" variant="outline">
              <Link to={ROUTES.MARKETPLACE}>Browse Marketplace</Link>
            </Button>
          </CardContent>
        </Card>
      ) : services.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg font-light">
              Approved Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.12] text-left text-muted-foreground">
                    <th className="pb-3 font-medium">Service</th>
                    <th className="pb-3 font-medium">Merchant</th>
                    <th className="pb-3 font-medium">Type</th>
                    <th className="pb-3 font-medium">Category</th>
                    <th className="pb-3 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {services.map((svc) => (
                    <tr
                      key={svc.id}
                      className="border-b border-white/[0.12] last:border-0"
                    >
                      <td className="py-3 font-medium text-foreground">
                        {svc.name}
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {svc.merchantName}
                      </td>
                      <td className="py-3">
                        <Badge
                          variant="secondary"
                          className="bg-primary/10 text-primary text-xs"
                        >
                          {svc.type.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {svc.category}
                      </td>
                      <td className="py-3 text-right">
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="rounded-full"
                        >
                          <Link to={ROUTES.CONSUMER_SERVICE_DETAIL(svc.id)}>
                            View
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
