import { useState, useMemo } from 'react'
import { PageHeader } from '@/components/shared/page-header.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { Input } from '@/components/ui/input.tsx'
import { ChevronDownIcon, SearchIcon } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table.tsx'
import { getAuditLogs } from '@/mocks/handlers.ts'
import { ROUTES } from '@/lib/constants.ts'

const ACTION_OPTIONS = [
  { value: 'all', label: 'All Actions' },
  { value: 'merchant.invited', label: 'merchant.invited' },
  { value: 'merchant.registered', label: 'merchant.registered' },
  { value: 'merchant.suspended', label: 'merchant.suspended' },
  { value: 'merchant.approved', label: 'merchant.approved' },
  { value: 'merchant.rejected', label: 'merchant.rejected' },
  { value: 'merchant.disabled', label: 'merchant.disabled' },
  { value: 'merchant.flagged', label: 'merchant.flagged' },
  { value: 'merchant.unflagged', label: 'merchant.unflagged' },
  { value: 'merchant.subscriptions_blocked', label: 'merchant.subscriptions_blocked' },
  { value: 'merchant.subscriptions_unblocked', label: 'merchant.subscriptions_unblocked' },
  { value: 'service.created', label: 'service.created' },
  { value: 'service.approved', label: 'service.approved' },
  { value: 'service.updated', label: 'service.updated' },
  { value: 'consumer.registered', label: 'consumer.registered' },
  { value: 'access.requested', label: 'access.requested' },
  { value: 'access.approved', label: 'access.approved' },
  { value: 'apikey.created', label: 'apikey.created' },
  { value: 'apikey.revoked', label: 'apikey.revoked' },
  { value: 'image.deprecated', label: 'image.deprecated' },
  { value: 'image.disabled', label: 'image.disabled' },
  { value: 'consumer.service_blocked', label: 'consumer.service_blocked' },
  { value: 'consumer.service_unblocked', label: 'consumer.service_unblocked' },
] as const

export function AdminGovernancePage() {
  const [actionFilter, setActionFilter] = useState('all')
  const [search, setSearch] = useState('')

  const logs = useMemo(() => {
    const params: { action?: string; search?: string; pageSize: number } = { pageSize: 1000 }
    if (actionFilter !== 'all') params.action = actionFilter
    if (search.trim()) params.search = search.trim()
    return getAuditLogs(params).data
  }, [actionFilter, search])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Governance"
        description="Audit logs and platform configuration"
        breadcrumbs={[
          { label: 'Admin', href: ROUTES.ADMIN_DASHBOARD },
          { label: 'Governance' },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg font-light">
            Audit Logs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                aria-label="Search audit logs"
              />
            </div>
            <div className="relative">
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                aria-label="Filter by action"
                className="h-10 appearance-none rounded-full border border-white/20 bg-card pl-4 pr-12 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              >
                {ACTION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.12]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No audit logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{log.actorName}</TableCell>
                      <TableCell className="text-muted-foreground">{log.description}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg font-light">
            Platform Config
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Badge variant="secondary" className="bg-amber-500/15 text-amber-400">
            TBD
          </Badge>
          <p className="text-sm text-muted-foreground">
            Platform configuration coming soon
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
