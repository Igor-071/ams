import { useState, useMemo, useCallback } from 'react'
import { useParams } from 'react-router'
import { format, parseISO } from 'date-fns'
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header.tsx'
import { ReportActions } from '@/components/shared/report-actions.tsx'
import { toCsvString, downloadCsv, type CsvColumn } from '@/lib/csv-export.ts'
import { Pagination } from '@/components/shared/pagination.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table.tsx'
import { ROUTES } from '@/lib/constants.ts'
import { getUsageRecordsByDate, getServiceById } from '@/mocks/handlers.ts'

type SortKey =
  | 'consumerId'
  | 'merchantName'
  | 'requestPayloadSize'
  | 'responsePayloadSize'
  | 'timestamp'
  | 'statusCode'
  | 'serviceName'
  | 'serviceType'

const COLUMNS: { label: string; sortKey: SortKey }[] = [
  { label: 'Consumer', sortKey: 'consumerId' },
  { label: 'Merchant', sortKey: 'merchantName' },
  { label: 'Request Size', sortKey: 'requestPayloadSize' },
  { label: 'Response Size', sortKey: 'responsePayloadSize' },
  { label: 'Timestamp', sortKey: 'timestamp' },
  { label: 'Status Code', sortKey: 'statusCode' },
  { label: 'Service Name', sortKey: 'serviceName' },
  { label: 'Service Type', sortKey: 'serviceType' },
]

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function AdminUsageDetailPage() {
  const { date } = useParams<{ date: string }>()
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState<SortKey>('timestamp')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const handleSort = useCallback((key: SortKey) => {
    setSortBy((prev) => {
      if (prev === key) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
      } else {
        setSortDir('asc')
      }
      return key
    })
    setPage(1)
  }, [])

  const result = useMemo(
    () =>
      getUsageRecordsByDate(date ?? '', {
        page,
        pageSize: 20,
        sortBy,
        sortOrder: sortDir,
      }),
    [date, page, sortBy, sortDir],
  )

  const allRecordsForExport = useMemo(
    () =>
      getUsageRecordsByDate(date ?? '', {
        page: 1,
        pageSize: 10000,
        sortBy,
        sortOrder: sortDir,
      }),
    [date, sortBy, sortDir],
  )

  const handleExport = () => {
    const columns: CsvColumn<(typeof allRecordsForExport.data)[0]>[] = [
      { header: 'Consumer', accessor: (r) => r.consumerId },
      { header: 'Merchant', accessor: (r) => getServiceById(r.serviceId)?.merchantName ?? 'Unknown' },
      { header: 'Request Size', accessor: (r) => r.requestPayloadSize },
      { header: 'Response Size', accessor: (r) => r.responsePayloadSize },
      { header: 'Timestamp', accessor: (r) => r.timestamp },
      { header: 'Status Code', accessor: (r) => r.statusCode },
      { header: 'Service Name', accessor: (r) => getServiceById(r.serviceId)?.name ?? 'Unknown' },
      { header: 'Service Type', accessor: (r) => getServiceById(r.serviceId)?.type === 'docker' ? 'Docker' : 'API' },
    ]
    downloadCsv(toCsvString(columns, allRecordsForExport.data), `admin-usage-${date}.csv`)
  }

  const generateSummary = () =>
    `Admin Usage Detail — ${date}\nTotal Requests: ${result.total.toLocaleString()}`

  const isValidDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date)
  const formattedDate = isValidDate
    ? format(parseISO(date), 'MMMM d, yyyy')
    : date ?? 'Unknown'

  if (!isValidDate || result.total === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={`Usage — ${formattedDate}`}
          breadcrumbs={[
            { label: 'Dashboard', href: ROUTES.ADMIN_DASHBOARD },
            { label: 'Usage', href: ROUTES.ADMIN_USAGE },
            { label: date ?? 'Unknown' },
          ]}
        />
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No usage records found for this date.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Usage — ${formattedDate}`}
        description={`${result.total.toLocaleString()} total requests`}
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.ADMIN_DASHBOARD },
          { label: 'Usage', href: ROUTES.ADMIN_USAGE },
          { label: formattedDate },
        ]}
        actions={<ReportActions onExport={handleExport} generateSummary={generateSummary} />}
      />

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg font-light">
            Request Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-white/[0.12]">
            <Table>
              <TableHeader>
                <TableRow>
                  {COLUMNS.map((col) => {
                    const isActive = sortBy === col.sortKey
                    const Icon = isActive
                      ? sortDir === 'asc'
                        ? ArrowUp
                        : ArrowDown
                      : ArrowUpDown
                    return (
                      <TableHead key={col.sortKey}>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 hover:text-foreground"
                          onClick={() => handleSort(col.sortKey)}
                        >
                          {col.label}
                          <Icon className="h-3.5 w-3.5" />
                        </button>
                      </TableHead>
                    )
                  })}
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.data.map((record) => {
                  const service = getServiceById(record.serviceId)
                  return (
                    <TableRow key={record.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {record.consumerId}
                      </TableCell>
                      <TableCell>{service?.merchantName ?? 'Unknown'}</TableCell>
                      <TableCell>{formatBytes(record.requestPayloadSize)}</TableCell>
                      <TableCell>{formatBytes(record.responsePayloadSize)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {format(parseISO(record.timestamp), 'HH:mm:ss')}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            record.statusCode < 400
                              ? 'bg-green-500/15 text-green-400'
                              : 'bg-red-500/15 text-red-400'
                          }`}
                        >
                          {record.statusCode}
                        </span>
                      </TableCell>
                      <TableCell>{service?.name ?? 'Unknown'}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full bg-blue-500/15 px-2 py-0.5 text-xs font-medium text-blue-400">
                          {service?.type === 'docker' ? 'Docker' : 'API'}
                        </span>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {result.totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={result.totalPages}
              onPageChange={setPage}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
