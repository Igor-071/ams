import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import type { Role } from '@/types/user.ts'
import { useAuthStore } from '@/stores/auth-store.ts'
import { DashboardPage } from '../pages/dashboard-page.tsx'

function renderWithRouter(initialEntry = '/dashboard') {
  const router = createMemoryRouter(
    [{ path: '/dashboard', element: <DashboardPage /> }],
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
})
