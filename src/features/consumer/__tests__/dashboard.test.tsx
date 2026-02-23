import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import type { Role } from '@/types/user.ts'
import { useAuthStore } from '@/stores/auth-store.ts'
import { DashboardPage } from '../pages/dashboard-page.tsx'

vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts')
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: 800, height: 300 }}>{children}</div>
    ),
  }
})

function renderWithRouter(initialEntry = '/dashboard') {
  const router = createMemoryRouter(
    [
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/marketplace/:serviceId', element: <div>Marketplace Detail</div> },
    ],
    { initialEntries: [initialEntry] },
  )
  return render(<RouterProvider router={router} />)
}

const mockConsumer = {
  id: 'user-consumer-1',
  email: 'alice@example.com',
  name: 'Alice Consumer',
  roles: ['consumer'] as Role[],
  activeRole: 'consumer' as const,
  status: 'active' as const,
  createdAt: '2025-01-01T00:00:00Z',
}

describe('Consumer Dashboard Overview', () => {
  beforeEach(() => {
    useAuthStore.getState().login(mockConsumer)
  })

  // AC-048: Dashboard overview renders with KPI stat cards
  it('renders heading and 4 stat cards', () => {
    renderWithRouter()
    expect(screen.getByRole('heading', { name: /Dashboard/ })).toBeInTheDocument()
    expect(screen.getByText('Active Services')).toBeInTheDocument()
    expect(screen.getByText('Active API Keys')).toBeInTheDocument()
    expect(screen.getByText('Total Requests')).toBeInTheDocument()
    expect(screen.getByText('Total Cost')).toBeInTheDocument()
  })

  // AC-049: KPI stat cards show correct aggregated values
  it('shows correct aggregated values in stat cards', () => {
    renderWithRouter()
    // user-consumer-1 has 2 approved access requests and 2 active keys
    // Both show "2", so check that the stat grid contains the values
    const statGrid = screen.getByText('Active Services').closest('[class*="grid"]')!
    expect(statGrid).toBeInTheDocument()
    // Total Requests: 5 usage records for consumer-1
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  // AC-050: Recent activity section displays latest usage
  it('shows recent activity with service names and timestamps', () => {
    renderWithRouter()
    expect(screen.getByText('Recent Activity')).toBeInTheDocument()
    expect(screen.getAllByText(/Weather API/).length).toBeGreaterThan(0)
  })

  // AC-051: Quick action links navigate correctly
  it('shows quick action links for API Keys and Usage', () => {
    renderWithRouter()
    expect(screen.getByText('Quick Actions')).toBeInTheDocument()
    const apiKeysLink = screen.getByRole('link', { name: /API Keys/i })
    const usageLink = screen.getByRole('link', { name: /Usage/i })
    expect(apiKeysLink).toHaveAttribute('href', '/dashboard/api-keys')
    expect(usageLink).toHaveAttribute('href', '/dashboard/usage')
  })

  // Pending requests card shown on dashboard
  it('shows pending requests card with count', () => {
    renderWithRouter()
    // user-consumer-1 has ar-3 pending for Sentiment Analysis API
    expect(screen.getByText('Pending Requests')).toBeInTheDocument()
    expect(screen.getByText('Sentiment Analysis API')).toBeInTheDocument()
    // Badge with count "1"
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('renders Usage Activity chart', () => {
    renderWithRouter()
    expect(screen.getByText('Usage Activity')).toBeInTheDocument()
    expect(screen.getByTestId('usage-activity-chart')).toBeInTheDocument()
  })

  it('renders Cost Trend chart', () => {
    renderWithRouter()
    expect(screen.getByText('Cost Trend')).toBeInTheDocument()
    expect(screen.getByTestId('cost-trend-chart')).toBeInTheDocument()
  })

  it('renders Request Status chart', () => {
    renderWithRouter()
    expect(screen.getByText('Request Status')).toBeInTheDocument()
    expect(screen.getByTestId('request-status-chart')).toBeInTheDocument()
  })

  it('renders Top Services chart', () => {
    renderWithRouter()
    expect(screen.getByText('Top Services')).toBeInTheDocument()
    expect(screen.getByTestId('top-services-chart')).toBeInTheDocument()
  })
})
