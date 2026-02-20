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
import { useAuthStore } from '@/stores/auth-store.ts'
import { getInvoicesByMerchant } from '@/mocks/handlers.ts'
import { ROUTES } from '@/lib/constants.ts'

function invoiceStatusToStatus(status: string): string {
  if (status === 'issued') return 'pending'
  if (status === 'paid') return 'active'
  if (status === 'overdue') return 'expired'
  return status
}

export function MerchantInvoicesPage() {
  const { currentUser } = useAuthStore()
  const navigate = useNavigate()
  const merchantId = currentUser?.id ?? ''

  const invoices = useMemo(
    () => getInvoicesByMerchant(merchantId, { pageSize: 100 }).data,
    [merchantId],
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Monthly invoices for your services"
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.MERCHANT_DASHBOARD },
          { label: 'Invoices' },
        ]}
      />

      <div className="rounded-2xl border border-white/[0.06]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Period</TableHead>
              <TableHead>Consumer</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No invoices yet
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((inv) => (
                <TableRow
                  key={inv.id}
                  className="cursor-pointer"
                  onClick={() => navigate(ROUTES.MERCHANT_INVOICE_DETAIL(inv.id))}
                >
                  <TableCell className="font-medium">{inv.period}</TableCell>
                  <TableCell>{inv.consumerName}</TableCell>
                  <TableCell className="text-right">
                    ${inv.total.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={invoiceStatusToStatus(inv.status)} />
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
