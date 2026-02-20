import { useState, useMemo } from 'react'
import { PageHeader } from '@/components/shared/page-header.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { Button } from '@/components/ui/button.tsx'
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

const ACTION_FILTERS = [
  'all',
  'merchant.invited',
  'merchant.registered',
  'merchant.suspended',
  'service.created',
  'service.approved',
  'consumer.registered',
  'access.requested',
  'access.approved',
  'apikey.created',
  'apikey.revoked',
] as const

export function AdminGovernancePage() {
  const [actionFilter, setActionFilter] = useState('all')

  const logs = useMemo(() => {
    const params: { action?: string; pageSize: number } = { pageSize: 1000 }
    if (actionFilter !== 'all') params.action = actionFilter
    return getAuditLogs(params).data
  }, [actionFilter])

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
          <div className="flex flex-wrap gap-2">
            {ACTION_FILTERS.map((filter) => (
              <Button
                key={filter}
                variant={actionFilter === filter ? 'default' : 'outline'}
                size="sm"
                className="rounded-full text-xs"
                onClick={() => setActionFilter(filter)}
              >
                {filter === 'all' ? 'All' : filter}
              </Button>
            ))}
          </div>

          <div className="rounded-2xl border border-white/[0.06]">
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
