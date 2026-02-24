import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import type { DateRange } from 'react-day-picker'
import { PageHeader } from '@/components/shared/page-header.tsx'
import { ReportActions } from '@/components/shared/report-actions.tsx'
import { DateRangeFilter } from '@/components/shared/date-range-filter.tsx'
import { toCsvString, downloadCsv, type CsvColumn } from '@/lib/csv-export.ts'
import type { Invoice } from '@/types/invoice.ts'
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

  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  })

  const allInvoices = useMemo(
    () => getInvoicesByMerchant(merchantId, { pageSize: 100 }).data,
    [merchantId],
  )

  const invoices = useMemo(() => {
    if (!dateRange.from) return allInvoices
    return allInvoices.filter((inv) => {
      const issued = new Date(inv.issuedAt)
      if (dateRange.from && issued < dateRange.from) return false
      if (dateRange.to && issued > dateRange.to) return false
      return true
    })
  }, [allInvoices, dateRange])

  const handleExport = () => {
    const columns: CsvColumn<Invoice>[] = [
      { header: 'Period', accessor: (r) => r.period },
      { header: 'Consumer', accessor: (r) => r.consumerName },
      { header: 'Total', accessor: (r) => `$${r.total.toFixed(2)}` },
      { header: 'Status', accessor: (r) => r.status },
    ]
    downloadCsv(toCsvString(columns, invoices), 'merchant-invoices.csv')
  }

  const generateSummary = () => {
    const total = invoices.reduce((sum, inv) => sum + inv.total, 0)
    return `Merchant Invoices Report\nInvoices: ${invoices.length}\nTotal: $${total.toFixed(2)}`
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Monthly invoices for your services"
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.MERCHANT_DASHBOARD },
          { label: 'Invoices' },
        ]}
        actions={<ReportActions onExport={handleExport} generateSummary={generateSummary} />}
      />

      <DateRangeFilter dateRange={dateRange} onDateRangeChange={setDateRange} />

      <div className="rounded-2xl border border-white/[0.12]">
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
