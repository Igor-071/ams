import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router'
import { PlusIcon } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header.tsx'
import { Button } from '@/components/ui/button.tsx'
import { StatusBadge } from '@/components/shared/status-badge.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table.tsx'
import { useAuthStore } from '@/stores/auth-store.ts'
import { getServicesByMerchant } from '@/mocks/handlers.ts'
import { ROUTES } from '@/lib/constants.ts'

export function MerchantServicesPage() {
  const { currentUser } = useAuthStore()
  const navigate = useNavigate()
  const merchantId = currentUser?.id ?? ''

  const services = useMemo(
    () => getServicesByMerchant(merchantId, { pageSize: 100 }).data,
    [merchantId],
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Services"
        description="Manage your service listings"
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.MERCHANT_DASHBOARD },
          { label: 'Services' },
        ]}
        actions={
          <Button className="rounded-full" asChild>
            <Link to={ROUTES.MERCHANT_SERVICE_NEW}>
              <PlusIcon className="mr-2 h-4 w-4" />
              New Service
            </Link>
          </Button>
        }
      />

      <div className="rounded-2xl border border-white/[0.12]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Category</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((service) => (
              <TableRow
                key={service.id}
                className="cursor-pointer"
                onClick={() => navigate(ROUTES.MERCHANT_SERVICE_DETAIL(service.id))}
              >
                <TableCell className="font-medium">{service.name}</TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary text-xs"
                  >
                    {service.type.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>
                  <StatusBadge status={service.status === 'pending_approval' ? 'pending' : service.status} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {service.category}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
