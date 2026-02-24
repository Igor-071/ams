import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import {
  BarChart3Icon,
  DollarSignIcon,
  ClockIcon,
  AlertCircleIcon,
  ChevronDownIcon,
  SearchIcon,
  CheckIcon,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header.tsx'
import { ReportActions } from '@/components/shared/report-actions.tsx'
import { toCsvString, downloadCsv, type CsvColumn } from '@/lib/csv-export.ts'
import { StatCard } from '@/components/shared/stat-card.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover.tsx'
import { Input } from '@/components/ui/input.tsx'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table.tsx'
import { useAuthStore } from '@/stores/auth-store.ts'
import {
  getUsageByMerchant,
  getServicesByMerchant,
  getApiKeysForService,
  getServiceById,
  getDailyUsage,
} from '@/mocks/handlers.ts'
import { ROUTES } from '@/lib/constants.ts'
import { ConsumptionChart } from '../components/consumption-chart.tsx'

export function MerchantUsagePage() {
  const navigate = useNavigate()
  const { currentUser } = useAuthStore()
  const merchantId = currentUser?.id ?? ''

  const [serviceFilter, setServiceFilter] = useState<string>('all')
  const [filterSearch, setFilterSearch] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)

  const merchantServices = useMemo(
    () => getServicesByMerchant(merchantId, { pageSize: 100 }).data,
    [merchantId],
  )

  const allUsageRecords = useMemo(
    () => getUsageByMerchant(merchantId),
    [merchantId],
  )

  const filteredRecords = useMemo(
    () =>
      serviceFilter === 'all'
        ? allUsageRecords
        : allUsageRecords.filter((u) => u.serviceId === serviceFilter),
    [allUsageRecords, serviceFilter],
  )

  const stats = useMemo(() => {
    const totalRequests = filteredRecords.length
    const totalRevenue = filteredRecords.reduce((sum, r) => {
      const svc = getServiceById(r.serviceId)
      return sum + (svc?.pricing.pricePerRequest ?? 0)
    }, 0)
    const avgResponseTime =
      totalRequests > 0
        ? Math.round(
            filteredRecords.reduce((sum, r) => sum + r.responseTimeMs, 0) /
              totalRequests,
          )
        : 0
    const errorCount = filteredRecords.filter((r) => r.statusCode >= 400).length
    const errorRate =
      totalRequests > 0 ? (errorCount / totalRequests) * 100 : 0

    return { totalRequests, totalRevenue, avgResponseTime, errorRate }
  }, [filteredRecords])

  const byApiKey = useMemo(() => {
    const serviceIds =
      serviceFilter === 'all'
        ? merchantServices.map((s) => s.id)
        : [serviceFilter]

    const keyMap = new Map<
      string,
      {
        keyName: string
        keyPrefix: string
        serviceName: string
        requests: number
        revenue: number
        status: string
      }
    >()

    for (const svcId of serviceIds) {
      const keys = getApiKeysForService(svcId)
      const svc = getServiceById(svcId)
      for (const key of keys) {
        const existing = keyMap.get(key.id)
        const usageCount = filteredRecords.filter(
          (u) => u.apiKeyId === key.id && u.serviceId === svcId,
        ).length
        const revenue = usageCount * (svc?.pricing.pricePerRequest ?? 0)

        if (existing) {
          existing.requests += usageCount
          existing.revenue += revenue
        } else {
          keyMap.set(key.id, {
            keyName: key.name,
            keyPrefix: key.keyPrefix,
            serviceName: svc?.name ?? 'Unknown',
            requests: usageCount,
            revenue,
            status: key.status,
          })
        }
      }
    }

    return Array.from(keyMap.entries()).map(([id, data]) => ({ id, ...data }))
  }, [merchantServices, serviceFilter, filteredRecords])

  const dailyUsage = useMemo(() => getDailyUsage(), [])

  const handleExport = () => {
    const columns: CsvColumn<(typeof byApiKey)[0]>[] = [
      { header: 'Key Name', accessor: (r) => r.keyName },
      { header: 'Key Prefix', accessor: (r) => r.keyPrefix },
      { header: 'Service', accessor: (r) => r.serviceName },
      { header: 'Requests', accessor: (r) => r.requests },
      { header: 'Revenue', accessor: (r) => `$${r.revenue.toFixed(3)}` },
      { header: 'Status', accessor: (r) => r.status },
    ]
    downloadCsv(toCsvString(columns, byApiKey), 'merchant-usage-by-api-key.csv')
  }

  const generateSummary = () =>
    `Merchant Usage Report\nTotal Requests: ${stats.totalRequests.toLocaleString()}\nTotal Revenue: $${stats.totalRevenue.toFixed(3)}\nAvg Response Time: ${stats.avgResponseTime}ms\nError Rate: ${stats.errorRate.toFixed(1)}%`

  const recentRequests = useMemo(
    () =>
      [...filteredRecords].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      ),
    [filteredRecords],
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usage"
        description="Monitor API consumption across your services"
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.MERCHANT_DASHBOARD },
          { label: 'Usage' },
        ]}
        actions={<ReportActions onExport={handleExport} generateSummary={generateSummary} />}
      />

      {/* Service filter dropdown */}
      <Popover open={filterOpen} onOpenChange={(open) => { setFilterOpen(open); if (!open) setFilterSearch('') }}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Filter by service"
            className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-4 py-1.5 font-heading text-sm font-light text-foreground transition-colors hover:bg-white/[0.10]"
          >
            {serviceFilter === 'all'
              ? 'All Services'
              : merchantServices.find((s) => s.id === serviceFilter)?.name ?? 'All Services'}
            <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-64 p-0">
          <div className="border-b border-white/[0.06] p-2">
            <div className="relative">
              <SearchIcon className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search services..."
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                className="h-8 pl-8 text-sm"
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto p-1">
            {/* All Services option */}
            {'All Services'.toLowerCase().includes(filterSearch.toLowerCase()) && (
              <button
                type="button"
                onClick={() => { setServiceFilter('all'); setFilterOpen(false); setFilterSearch('') }}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors hover:bg-white/[0.06]"
              >
                <CheckIcon className={`h-4 w-4 shrink-0 ${serviceFilter === 'all' ? 'text-primary' : 'text-transparent'}`} />
                <span className={serviceFilter === 'all' ? 'text-foreground' : 'text-muted-foreground'}>All Services</span>
              </button>
            )}
            {merchantServices
              .filter((svc) => svc.name.toLowerCase().includes(filterSearch.toLowerCase()))
              .map((svc) => (
                <button
                  key={svc.id}
                  type="button"
                  onClick={() => { setServiceFilter(svc.id); setFilterOpen(false); setFilterSearch('') }}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors hover:bg-white/[0.06]"
                >
                  <CheckIcon className={`h-4 w-4 shrink-0 ${serviceFilter === svc.id ? 'text-primary' : 'text-transparent'}`} />
                  <span className={serviceFilter === svc.id ? 'text-foreground' : 'text-muted-foreground'}>{svc.name}</span>
                </button>
              ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Requests"
          value={stats.totalRequests.toLocaleString()}
          icon={BarChart3Icon}
        />
        <StatCard
          label="Total Revenue"
          value={`$${stats.totalRevenue.toFixed(3)}`}
          icon={DollarSignIcon}
        />
        <StatCard
          label="Avg Response Time"
          value={`${stats.avgResponseTime}ms`}
          icon={ClockIcon}
        />
        <StatCard
          label="Error Rate"
          value={`${stats.errorRate.toFixed(1)}%`}
          icon={AlertCircleIcon}
        />
      </div>

      {/* Consumption chart */}
      <ConsumptionChart
        dailyUsage={dailyUsage}
        onDateClick={(date) => navigate(ROUTES.MERCHANT_USAGE_DETAIL(date))}
      />

      {/* By API Key table */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg font-light">
            By API Key
          </CardTitle>
        </CardHeader>
        <CardContent>
          {byApiKey.length === 0 ? (
            <p className="text-sm text-muted-foreground">No usage data</p>
          ) : (
            <div className="rounded-2xl border border-white/[0.12]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Key Name</TableHead>
                    <TableHead>Key Prefix</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead className="text-right">Requests</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {byApiKey.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">
                        {row.keyName}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {row.keyPrefix}
                      </TableCell>
                      <TableCell>{row.serviceName}</TableCell>
                      <TableCell className="text-right">
                        {row.requests}
                      </TableCell>
                      <TableCell className="text-right">
                        ${row.revenue.toFixed(3)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            row.status === 'active'
                              ? 'bg-green-500/15 text-green-400'
                              : row.status === 'expired'
                                ? 'bg-yellow-500/15 text-yellow-400'
                                : 'bg-red-500/15 text-red-400'
                          }`}
                        >
                          {row.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Requests table */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg font-light">
            Recent Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground">No requests yet</p>
          ) : (
            <div className="rounded-2xl border border-white/[0.12]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>API Key</TableHead>
                    <TableHead className="text-right">Response Time</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentRequests.map((record) => {
                    const svc = getServiceById(record.serviceId)
                    return (
                      <TableRow key={record.id}>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(record.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>{svc?.name ?? 'Unknown'}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {record.apiKeyId}
                        </TableCell>
                        <TableCell className="text-right">
                          {record.responseTimeMs}ms
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
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
