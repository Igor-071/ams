import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import type { Role } from '@/types/user.ts'
import { useAuthStore } from '@/stores/auth-store.ts'
import { UsagePage } from '../pages/usage-page.tsx'

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

const mockConsumer = {
  id: 'user-consumer-1',
  email: 'alice@example.com',
  name: 'Alice Consumer',
  roles: ['consumer'] as Role[],
  activeRole: 'consumer' as const,
  status: 'active' as const,
  createdAt: '2025-01-01T00:00:00Z',
}

function renderUsagePage() {
  const router = createMemoryRouter(
    [{ path: '/dashboard/usage', element: <UsagePage /> }],
    { initialEntries: ['/dashboard/usage'] },
  )
  return render(<RouterProvider router={router} />)
}

describe('Usage Dashboard', () => {
  beforeEach(() => {
    useAuthStore.getState().login(mockConsumer)
  })

  // AC-059: Usage page renders with summary stats
  it('renders summary stat cards', () => {
    renderUsagePage()
    expect(screen.getAllByText('Total Requests').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Total Cost').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Avg Response Time')).toBeInTheDocument()
    expect(screen.getByText('Error Rate')).toBeInTheDocument()
  })

  // AC-060: Consumption chart replaces daily usage table
  it('renders consumption chart', () => {
    renderUsagePage()
    expect(screen.getByText('Consumption Over Time')).toBeInTheDocument()
    expect(screen.getByTestId('consumption-chart')).toBeInTheDocument()
  })

  // AC-061: Usage by service breakdown
  it('shows per-service usage breakdown', () => {
    renderUsagePage()
    expect(screen.getByText('By Service')).toBeInTheDocument()
    // consumer-1 has usage for Weather API (svc-1) and Geocoding API (svc-2)
    expect(screen.getByText('Weather API')).toBeInTheDocument()
    expect(screen.getByText('Geocoding API')).toBeInTheDocument()
  })

  it('renders By API Key table with key names', () => {
    renderUsagePage()
    expect(screen.getByText('By API Key')).toBeInTheDocument()
    expect(screen.getByText('Production Key')).toBeInTheDocument()
    expect(screen.getByText('Development Key')).toBeInTheDocument()
  })

  it('renders date range picker button with default label', () => {
    renderUsagePage()
    const pickerButton = screen.getByRole('button', { name: /Select date range/ })
    expect(pickerButton).toBeInTheDocument()
    expect(pickerButton).toHaveTextContent('This Month')
  })
})
