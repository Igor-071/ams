import { useMemo } from 'react'
import { useNavigate } from 'react-router'
import { PageHeader } from '@/components/shared/page-header.tsx'
import { StatusBadge } from '@/components/shared/status-badge.tsx'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table.tsx'
import { getUsers, getConsumerProfile } from '@/mocks/handlers.ts'
import { ROUTES } from '@/lib/constants.ts'

export function AdminConsumersPage() {
  const navigate = useNavigate()

  const consumers = useMemo(() => {
    const users = getUsers({ pageSize: 1000 }).data
    return users
      .filter((u) => u.roles.includes('consumer'))
      .map((u) => {
        const profile = getConsumerProfile(u.id)
        return {
          ...u,
          organization: profile?.organization ?? '',
        }
      })
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Consumers"
        description="Manage consumer accounts"
        breadcrumbs={[
          { label: 'Admin', href: ROUTES.ADMIN_DASHBOARD },
          { label: 'Consumers' },
        ]}
      />

      <div className="rounded-2xl border border-white/[0.06]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {consumers.map((c) => (
              <TableRow
                key={c.id}
                className="cursor-pointer"
                onClick={() => navigate(ROUTES.ADMIN_CONSUMER_DETAIL(c.id))}
              >
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="text-muted-foreground">{c.email}</TableCell>
                <TableCell>{c.organization || '—'}</TableCell>
                <TableCell>
                  <StatusBadge status={c.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
