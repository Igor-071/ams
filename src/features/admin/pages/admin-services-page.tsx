import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { PageHeader } from '@/components/shared/page-header.tsx'
import { StatusBadge } from '@/components/shared/status-badge.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { LockIcon } from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table.tsx'
import { getServices } from '@/mocks/handlers.ts'
import { ROUTES } from '@/lib/constants.ts'

type StatusFilter = 'all' | 'pending' | 'active'

export function AdminServicesPage() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const services = useMemo(() => {
    const all = getServices({ pageSize: 1000 }).data
    if (statusFilter === 'pending') return all.filter((s) => s.status === 'pending_approval')
    if (statusFilter === 'active') return all.filter((s) => s.status === 'active')
    return all
  }, [statusFilter])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Services"
        description="Review and manage service listings"
        breadcrumbs={[
          { label: 'Admin', href: ROUTES.ADMIN_DASHBOARD },
          { label: 'Services' },
        ]}
      />

      <div className="flex gap-2">
        {(['all', 'pending', 'active'] as StatusFilter[]).map((filter) => (
          <Button
            key={filter}
            variant={statusFilter === filter ? 'default' : 'outline'}
            size="sm"
            className="rounded-full capitalize"
            onClick={() => setStatusFilter(filter)}
          >
            {filter}
          </Button>
        ))}
      </div>

      <div className="rounded-2xl border border-white/[0.12]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Merchant</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No services found
                </TableCell>
              </TableRow>
            ) : (
              services.map((svc) => (
                <TableRow
                  key={svc.id}
                  className="cursor-pointer"
                  onClick={() => navigate(ROUTES.ADMIN_SERVICE_DETAIL(svc.id))}
                >
                  <TableCell className="font-medium">{svc.name}</TableCell>
                  <TableCell className="text-muted-foreground">{svc.merchantName}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                      {svc.type.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        svc.visibility === 'private'
                          ? 'bg-amber-500/15 text-amber-400 text-xs'
                          : 'bg-emerald-500/15 text-emerald-400 text-xs'
                      }
                    >
                      {svc.visibility === 'private' && <LockIcon className="mr-1 h-3 w-3" />}
                      {svc.visibility === 'private' ? 'Private' : 'Public'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={svc.status === 'pending_approval' ? 'pending' : svc.status} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
