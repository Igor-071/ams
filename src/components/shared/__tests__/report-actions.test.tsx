import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { ExportButton } from '../export-button.tsx'
import { ShareReportButton } from '../share-report-button.tsx'
import { DateRangeFilter } from '../date-range-filter.tsx'
import { ReportActions } from '../report-actions.tsx'

describe('ExportButton', () => {
  it('renders with default label and download icon', () => {
    render(<ExportButton onClick={() => {}} />)
    expect(screen.getByRole('button', { name: /Export CSV/i })).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    render(<ExportButton onClick={handleClick} />)
    await user.click(screen.getByRole('button', { name: /Export CSV/i }))
    expect(handleClick).toHaveBeenCalledOnce()
  })

  it('is disabled when disabled prop is true', () => {
    render(<ExportButton onClick={() => {}} disabled />)
    expect(screen.getByRole('button', { name: /Export CSV/i })).toBeDisabled()
  })
})

describe('DateRangeFilter', () => {
  it('renders with "This Month" label by default', () => {
    const range = { from: new Date(), to: new Date() }
    render(<DateRangeFilter dateRange={range} onDateRangeChange={() => {}} />)
    const trigger = screen.getByRole('button', { name: /Filter by date range/ })
    expect(trigger).toBeInTheDocument()
    expect(trigger).toHaveTextContent('This Month')
  })

  it('opens popover with preset buttons when clicked', async () => {
    const user = userEvent.setup()
    const range = { from: new Date(), to: new Date() }
    render(<DateRangeFilter dateRange={range} onDateRangeChange={() => {}} />)
    await user.click(screen.getByRole('button', { name: /Filter by date range/ }))
    expect(screen.getByText('3 Months')).toBeInTheDocument()
    expect(screen.getByText('6 Months')).toBeInTheDocument()
    expect(screen.getByText('This Year')).toBeInTheDocument()
  })

  it('calls onDateRangeChange when a preset is selected', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    const range = { from: new Date(), to: new Date() }
    render(<DateRangeFilter dateRange={range} onDateRangeChange={handleChange} />)
    await user.click(screen.getByRole('button', { name: /Filter by date range/ }))
    await user.click(screen.getByRole('button', { name: '3 Months' }))
    expect(handleChange).toHaveBeenCalledOnce()
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({ from: expect.any(Date), to: expect.any(Date) }))
  })
})

describe('ShareReportButton', () => {
  let writeTextSpy: ReturnType<typeof vi.fn<(data: string) => Promise<void>>>

  beforeEach(() => {
    writeTextSpy = vi.fn<(data: string) => Promise<void>>().mockResolvedValue(undefined)
    vi.spyOn(navigator.clipboard, 'writeText').mockImplementation(writeTextSpy)
  })

  it('renders with "Share" label', () => {
    render(<ShareReportButton generateSummary={() => 'summary'} />)
    expect(screen.getByRole('button', { name: /Share report/i })).toBeInTheDocument()
  })

  it('copies generated summary to clipboard on click', async () => {
    const user = userEvent.setup()
    render(<ShareReportButton generateSummary={() => 'Test Summary Report'} />)
    await user.click(screen.getByRole('button', { name: /Share report/i }))
    await waitFor(() => {
      expect(writeTextSpy).toHaveBeenCalledWith('Test Summary Report')
    })
  })

  it('shows check icon and "Copied!" text after click', async () => {
    const user = userEvent.setup()
    render(<ShareReportButton generateSummary={() => 'summary'} />)
    await user.click(screen.getByRole('button', { name: /Share report/i }))
    expect(screen.getByText('Copied!')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Copied/i })).toBeInTheDocument()
  })

  it('reverts to "Share" label after 2 seconds', async () => {
    const user = userEvent.setup()
    render(<ShareReportButton generateSummary={() => 'summary'} />)
    await user.click(screen.getByRole('button', { name: /Share report/i }))
    expect(screen.getByText('Copied!')).toBeInTheDocument()

    await waitFor(
      () => {
        expect(screen.queryByText('Copied!')).not.toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Share report/i })).toBeInTheDocument()
      },
      { timeout: 3000 },
    )
  })
})

describe('ReportActions', () => {
  it('renders both ExportButton and ShareReportButton', () => {
    render(
      <ReportActions
        onExport={() => {}}
        generateSummary={() => 'summary'}
      />,
    )
    expect(screen.getByRole('button', { name: /Export CSV/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Share report/i })).toBeInTheDocument()
  })
})
