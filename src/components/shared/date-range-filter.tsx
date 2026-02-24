import { useState } from 'react'
import { CalendarIcon } from 'lucide-react'
import { format, startOfMonth, startOfYear, subMonths } from 'date-fns'
import type { DateRange } from 'react-day-picker'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover.tsx'
import { Calendar } from '@/components/ui/calendar.tsx'

type PresetKey = 'this-month' | '3-months' | '6-months' | 'this-year'

const PRESET_LABELS: Record<PresetKey, string> = {
  'this-month': 'This Month',
  '3-months': '3 Months',
  '6-months': '6 Months',
  'this-year': 'This Year',
}

function getPresetRange(presetKey: PresetKey): DateRange {
  const now = new Date()
  switch (presetKey) {
    case 'this-month':
      return { from: startOfMonth(now), to: now }
    case '3-months':
      return { from: subMonths(now, 3), to: now }
    case '6-months':
      return { from: subMonths(now, 6), to: now }
    case 'this-year':
      return { from: startOfYear(now), to: now }
  }
}

interface DateRangeFilterProps {
  dateRange: DateRange
  onDateRangeChange: (range: DateRange) => void
}

export function DateRangeFilter({ dateRange, onDateRangeChange }: DateRangeFilterProps) {
  const [activePreset, setActivePreset] = useState<PresetKey | null>(
    dateRange.from ? 'this-month' : null,
  )
  const [popoverOpen, setPopoverOpen] = useState(false)

  const handlePresetClick = (key: PresetKey) => {
    const range = getPresetRange(key)
    onDateRangeChange(range)
    setActivePreset(key)
    setPopoverOpen(false)
  }

  const handleCalendarSelect = (range: DateRange | undefined) => {
    if (range) {
      onDateRangeChange(range)
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
      : 'All Time'

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Filter by date range"
          className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-4 py-1.5 font-heading text-sm font-light text-muted-foreground transition-colors hover:text-foreground"
        >
          <CalendarIcon className="h-4 w-4" />
          {triggerLabel}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
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
  )
}
