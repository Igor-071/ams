import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import type { Role } from '@/types/user.ts'
import { useAuthStore } from '@/stores/auth-store.ts'
import { MerchantUsagePage } from '../pages/merchant-usage-page.tsx'

// Mock ResponsiveContainer to avoid zero-size issues in jsdom
vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts')
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: 800, height: 300 }}>{children}</div>
    ),
  }
})

function renderUsagePage() {
  const router = createMemoryRouter(
    [{ path: '/merchant/usage', element: <MerchantUsagePage /> }],
    { initialEntries: ['/merchant/usage'] },
  )
  return render(<RouterProvider router={router} />)
}

const mockMerchant1 = {
  id: 'user-merchant-1',
  email: 'merchant@acme.com',
  name: 'James Merchant',
  roles: ['merchant'] as Role[],
  activeRole: 'merchant' as const,
  status: 'active' as const,
  createdAt: '2025-02-15T00:00:00Z',
}

const mockMerchant2 = {
  id: 'user-merchant-2',
  email: 'merchant@dataflow.io',
  name: 'DataFlow Merchant',
  roles: ['merchant'] as Role[],
  activeRole: 'merchant' as const,
  status: 'active' as const,
  createdAt: '2025-03-01T00:00:00Z',
}

describe('Merchant Usage Page', () => {
  beforeEach(() => {
    useAuthStore.getState().login(mockMerchant1)
  })

  it('renders page with heading and stat cards', () => {
    renderUsagePage()
    expect(screen.getByRole('heading', { name: /Usage/ })).toBeInTheDocument()
    expect(screen.getByText('Total Requests')).toBeInTheDocument()
    expect(screen.getByText('Total Revenue')).toBeInTheDocument()
    expect(screen.getByText('Avg Response Time')).toBeInTheDocument()
    expect(screen.getByText('Error Rate')).toBeInTheDocument()
  })

  it('displays correct total request count for merchant-1', () => {
    renderUsagePage()
    // merchant-1 owns svc-1 (5 records) and svc-2 (1 record) — 6 total
    expect(screen.getAllByText('6').length).toBeGreaterThanOrEqual(1)
  })

  it('shows By API Key table with key names', () => {
    renderUsagePage()
    expect(screen.getByText('By API Key')).toBeInTheDocument()
    expect(screen.getByText('Production Key')).toBeInTheDocument()
    expect(screen.getByText('Development Key')).toBeInTheDocument()
  })

  it('shows Recent Requests table with usage records', () => {
    renderUsagePage()
    expect(screen.getByText('Recent Requests')).toBeInTheDocument()
    // Should show status code badges — 5 records with 200 and 1 with 500
    expect(screen.getAllByText('200').length).toBeGreaterThanOrEqual(5)
    expect(screen.getAllByText('500').length).toBeGreaterThanOrEqual(1)
  })

  it('shows service filter dropdown with service names', async () => {
    const user = userEvent.setup()
    renderUsagePage()

    // Trigger button shows "All Services" by default
    const trigger = screen.getByRole('button', { name: /Filter by service/ })
    expect(trigger).toHaveTextContent('All Services')

    // Open dropdown and verify service names appear
    await user.click(trigger)
    expect(screen.getAllByText('Weather API').length).toBeGreaterThanOrEqual(2) // in dropdown + table
    expect(screen.getAllByText('Geocoding API').length).toBeGreaterThanOrEqual(2)
  })

  it('filters data when a service is selected from dropdown', async () => {
    const user = userEvent.setup()
    renderUsagePage()

    // Open dropdown
    const trigger = screen.getByRole('button', { name: /Filter by service/ })
    await user.click(trigger)

    // Click "Geocoding API" in the dropdown list
    const options = screen.getAllByText('Geocoding API')
    // The dropdown option (last one) — click it
    await user.click(options[options.length - 1])

    // Trigger should now show "Geocoding API"
    expect(trigger).toHaveTextContent('Geocoding API')

    // After filter, status 500 (from svc-1 only) should not appear
    expect(screen.queryByText('500')).not.toBeInTheDocument()

    // Recent Requests should show only svc-2 records (status 200)
    expect(screen.getAllByText('200').length).toBeGreaterThanOrEqual(1)
  })

  it('shows empty state when merchant has no usage data', () => {
    useAuthStore.getState().login(mockMerchant2)
    renderUsagePage()
    // merchant-2 owns svc-3 (docker) and svc-4 — no usage records for either
    expect(screen.getByText('No usage data')).toBeInTheDocument()
    expect(screen.getByText('No requests yet')).toBeInTheDocument()
  })

  it('renders consumption chart card with title', () => {
    renderUsagePage()
    expect(screen.getByText('Consumption Over Time')).toBeInTheDocument()
  })

  it('renders date range picker button with default label', () => {
    renderUsagePage()
    const pickerButton = screen.getByRole('button', { name: /Select date range/ })
    expect(pickerButton).toBeInTheDocument()
    expect(pickerButton).toHaveTextContent('This Month')
  })

  it('opens popover with preset buttons when date picker is clicked', async () => {
    const user = userEvent.setup()
    renderUsagePage()
    const pickerButton = screen.getByRole('button', { name: /Select date range/ })
    await user.click(pickerButton)

    expect(screen.getByText('3 Months')).toBeInTheDocument()
    expect(screen.getByText('6 Months')).toBeInTheDocument()
    expect(screen.getByText('This Year')).toBeInTheDocument()
  })

  it('updates trigger label when a preset is selected', async () => {
    const user = userEvent.setup()
    renderUsagePage()
    const pickerButton = screen.getByRole('button', { name: /Select date range/ })
    await user.click(pickerButton)

    // Click "3 Months" preset
    const threeMonthsButton = screen.getByRole('button', { name: '3 Months' })
    await user.click(threeMonthsButton)

    // Trigger button should now show "3 Months"
    expect(
      screen.getByRole('button', { name: /Select date range/ }),
    ).toHaveTextContent('3 Months')
  })

  it('renders consumption chart container element', () => {
    renderUsagePage()
    expect(screen.getByTestId('consumption-chart')).toBeInTheDocument()
  })
})
