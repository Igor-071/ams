import { useMemo } from 'react'
import { useParams } from 'react-router'
import { PageHeader } from '@/components/shared/page-header.tsx'
import { ReportActions } from '@/components/shared/report-actions.tsx'
import { toCsvString, downloadCsv, type CsvColumn } from '@/lib/csv-export.ts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { StatusBadge } from '@/components/shared/status-badge.tsx'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table.tsx'
import { getInvoiceById } from '@/mocks/handlers.ts'
import { ROUTES } from '@/lib/constants.ts'

function invoiceStatusToStatus(status: string): string {
  if (status === 'issued') return 'pending'
  if (status === 'paid') return 'active'
  if (status === 'overdue') return 'expired'
  return status
}

export function MerchantInvoiceDetailPage() {
  const { invoiceId } = useParams<{ invoiceId: string }>()
  const invoice = useMemo(() => getInvoiceById(invoiceId ?? ''), [invoiceId])

  const handleExport = () => {
    if (!invoice) return
    interface LineItemRow { serviceName: string; requestCount: number; unitPrice: string; subtotal: string }
    const lineItems: LineItemRow[] = invoice.lineItems.map((item) => ({
      serviceName: item.serviceName,
      requestCount: item.requestCount,
      unitPrice: `$${item.unitPrice.toFixed(3)}`,
      subtotal: `$${item.subtotal.toFixed(2)}`,
    }))
    lineItems.push(
      { serviceName: '', requestCount: 0, unitPrice: 'Subtotal', subtotal: `$${invoice.subtotal.toFixed(2)}` },
      { serviceName: '', requestCount: 0, unitPrice: `Commission (${(invoice.commissionRate * 100).toFixed(0)}%)`, subtotal: `-$${invoice.commission.toFixed(2)}` },
      { serviceName: '', requestCount: 0, unitPrice: 'Total (Net)', subtotal: `$${invoice.total.toFixed(2)}` },
    )
    const columns: CsvColumn<LineItemRow>[] = [
      { header: 'Service', accessor: (r) => r.serviceName },
      { header: 'Requests', accessor: (r) => r.requestCount },
      { header: 'Unit Price', accessor: (r) => r.unitPrice },
      { header: 'Subtotal', accessor: (r) => r.subtotal },
    ]
    downloadCsv(toCsvString(columns, lineItems), `invoice-${invoice.period}.csv`)
  }

  const generateSummary = () => {
    if (!invoice) return ''
    return `Invoice — ${invoice.period}\nConsumer: ${invoice.consumerName}\nStatus: ${invoice.status}\nSubtotal: $${invoice.subtotal.toFixed(2)}\nCommission: -$${invoice.commission.toFixed(2)}\nTotal: $${invoice.total.toFixed(2)}`
  }

  if (!invoice) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Invoice Not Found"
          breadcrumbs={[
            { label: 'Dashboard', href: ROUTES.MERCHANT_DASHBOARD },
            { label: 'Invoices', href: ROUTES.MERCHANT_INVOICES },
            { label: 'Not Found' },
          ]}
        />
        <p className="text-muted-foreground">This invoice does not exist.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Invoice — ${invoice.period}`}
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.MERCHANT_DASHBOARD },
          { label: 'Invoices', href: ROUTES.MERCHANT_INVOICES },
          { label: invoice.period },
        ]}
        actions={<ReportActions onExport={handleExport} generateSummary={generateSummary} />}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg font-light">
              Invoice Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Period</p>
              <p className="text-sm text-foreground">{invoice.period}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Consumer</p>
              <p className="text-sm text-foreground">{invoice.consumerName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <StatusBadge status={invoiceStatusToStatus(invoice.status)} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Issued</p>
              <p className="text-sm text-foreground">
                {new Date(invoice.issuedAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Due</p>
              <p className="text-sm text-foreground">
                {new Date(invoice.dueAt).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg font-light">
              Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Badge variant="secondary" className="bg-amber-500/15 text-amber-400">
              TBD
            </Badge>
            <p className="text-sm text-muted-foreground">
              Payment collection coming soon
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg font-light">
            Line Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-white/[0.12]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead className="text-right">Requests</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.lineItems.map((item) => (
                  <TableRow key={item.serviceId}>
                    <TableCell className="font-medium">{item.serviceName}</TableCell>
                    <TableCell className="text-right">
                      {item.requestCount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      ${item.unitPrice.toFixed(3)}
                    </TableCell>
                    <TableCell className="text-right">
                      ${item.subtotal.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">${invoice.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                AMS Commission ({(invoice.commissionRate * 100).toFixed(0)}%)
              </span>
              <span className="text-red-400">-${invoice.commission.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-white/[0.12] pt-2 font-medium">
              <span className="text-foreground">Total (Net)</span>
              <span className="text-foreground">${invoice.total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
