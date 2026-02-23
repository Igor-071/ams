import { useMemo, useState } from 'react'
import { CalendarIcon } from 'lucide-react'
import { format, parseISO, startOfMonth, startOfYear, subMonths } from 'date-fns'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import type { DateRange } from 'react-day-picker'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart.tsx'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover.tsx'
import { Calendar } from '@/components/ui/calendar.tsx'
import type { DailyUsage } from '@/types/usage.ts'

interface ConsumptionChartProps {
  dailyUsage: DailyUsage[]
  onDateClick?: (date: string) => void
}

type PresetKey = 'this-month' | '3-months' | '6-months' | 'this-year'

const PRESET_LABELS: Record<PresetKey, string> = {
  'this-month': 'This Month',
  '3-months': '3 Months',
  '6-months': '6 Months',
  'this-year': 'This Year',
}

const chartConfig = {
  requestCount: {
    label: 'Requests',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig

function getPresetRange(presetKey: PresetKey, anchorDate: Date): DateRange {
  switch (presetKey) {
    case 'this-month':
      return { from: startOfMonth(anchorDate), to: anchorDate }
    case '3-months':
      return { from: subMonths(anchorDate, 3), to: anchorDate }
    case '6-months':
      return { from: subMonths(anchorDate, 6), to: anchorDate }
    case 'this-year':
      return { from: startOfYear(anchorDate), to: anchorDate }
  }
}

export function ConsumptionChart({ dailyUsage, onDateClick }: ConsumptionChartProps) {
  const anchorDate = useMemo(() => {
    if (dailyUsage.length === 0) return new Date()
    return parseISO(dailyUsage[dailyUsage.length - 1].date)
  }, [dailyUsage])

  const [activePreset, setActivePreset] = useState<PresetKey | null>('this-month')
  const [dateRange, setDateRange] = useState<DateRange>(() =>
    getPresetRange('this-month', anchorDate),
  )
  const [popoverOpen, setPopoverOpen] = useState(false)

  const filteredData = useMemo(() => {
    if (!dateRange.from) return dailyUsage
    return dailyUsage.filter((d) => {
      const date = parseISO(d.date)
      if (dateRange.from && date < dateRange.from) return false
      if (dateRange.to && date > dateRange.to) return false
      return true
    })
  }, [dailyUsage, dateRange])

  const handlePresetClick = (key: PresetKey) => {
    const range = getPresetRange(key, anchorDate)
    setDateRange(range)
    setActivePreset(key)
    setPopoverOpen(false)
  }

  const handleCalendarSelect = (range: DateRange | undefined) => {
    if (range) {
      setDateRange(range)
      setActivePreset(null)
      if (range.from && range.to) {
        setPopoverOpen(false)
      }
    }
  }

  const triggerLabel = activePreset
    ? PRESET_LABELS[activePreset]
    : dateRange.from && dateRange.to
      ? `${format(dateRange.from, 'MMM d')} – ${format(dateRange.to, 'MMM d')}`
      : 'Select range'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-lg font-light">
          Consumption Over Time
        </CardTitle>
        <CardAction>
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label="Select date range"
                className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-4 py-1.5 font-heading text-sm font-light text-muted-foreground transition-colors hover:text-foreground"
              >
                <CalendarIcon className="h-4 w-4" />
                {triggerLabel}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <div className="flex flex-col gap-2 p-3">
                {(Object.entries(PRESET_LABELS) as [PresetKey, string][]).map(
                  ([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handlePresetClick(key)}
                      className={`rounded-full px-4 py-1.5 font-heading text-sm font-light transition-colors ${
                        activePreset === key
                          ? 'bg-primary text-white'
                          : 'bg-white/[0.06] text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {label}
                    </button>
                  ),
                )}
              </div>
              <div className="border-t border-white/[0.06] p-3">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={handleCalendarSelect}
                  numberOfMonths={1}
                  defaultMonth={dateRange.from}
                />
              </div>
            </PopoverContent>
          </Popover>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div data-testid="consumption-chart">
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <AreaChart
              data={filteredData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              style={onDateClick ? { cursor: 'pointer' } : undefined}
              onClick={(e) => {
                if (onDateClick && e?.activePayload?.[0]?.payload?.date) {
                  onDateClick(e.activePayload[0].payload.date as string)
                }
              }}
            >
              <defs>
                <linearGradient id="fillRequests" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.06)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tickFormatter={(value: string) => format(parseISO(value), 'MMM d')}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={45}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(_, payload) => {
                      if (payload?.[0]?.payload?.date) {
                        return format(parseISO(payload[0].payload.date), 'MMM d, yyyy')
                      }
                      return ''
                    }}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="requestCount"
                stroke="var(--chart-1)"
                strokeWidth={2}
                fill="url(#fillRequests)"
                activeDot={onDateClick ? { r: 6, strokeWidth: 2, cursor: 'pointer' } : undefined}
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
