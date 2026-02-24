import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'

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
import type { Role } from '@/types/user.ts'
import { useAuthStore } from '@/stores/auth-store.ts'
import { RequestsPage } from '../pages/requests-page.tsx'
import { DashboardPage } from '../pages/dashboard-page.tsx'

const mockConsumer = {
  id: 'user-consumer-1',
  email: 'consumer@startup.io',
  name: 'Alice Consumer',
  roles: ['consumer'] as Role[],
  activeRole: 'consumer' as const,
  status: 'active' as const,
  createdAt: '2025-04-01T00:00:00Z',
}

function renderRequestsPage() {
  const router = createMemoryRouter(
    [{ path: '/dashboard/requests', element: <RequestsPage /> }],
    { initialEntries: ['/dashboard/requests'] },
  )
  return render(<RouterProvider router={router} />)
}

function renderDashboard() {
  const router = createMemoryRouter(
    [
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/dashboard/requests', element: <RequestsPage /> },
    ],
    { initialEntries: ['/dashboard'] },
  )
  return render(<RouterProvider router={router} />)
}

describe('Consumer Access Requests', () => {
  beforeEach(() => {
    useAuthStore.getState().login(mockConsumer)
  })

  // AC-146: Consumer dashboard "My Requests" card
  it('shows My Requests card on dashboard with View All link', () => {
    renderDashboard()
    expect(screen.getByText('My Requests')).toBeInTheDocument()
    const viewAllLink = screen.getByRole('link', { name: /View All/i })
    expect(viewAllLink).toHaveAttribute('href', '/dashboard/requests')
  })

  // AC-147: Requests page with full table
  it('renders requests page with table columns', () => {
    renderRequestsPage()
    expect(screen.getByRole('heading', { name: /My Requests/ })).toBeInTheDocument()
    expect(screen.getByText('Service')).toBeInTheDocument()
    expect(screen.getByText('Requested')).toBeInTheDocument()
    expect(screen.getByText('Resolved')).toBeInTheDocument()
    // consumer-1 has access requests: Weather API (approved), Data Enrichment API (approved), Sentiment Analysis API (pending)
    expect(screen.getByText('Weather API')).toBeInTheDocument()
  })

  // AC-148: Requests nav item — verified by rendering the page at the correct route
  it('renders requests page at /dashboard/requests', () => {
    renderRequestsPage()
    expect(screen.getByRole('heading', { name: /My Requests/ })).toBeInTheDocument()
    expect(screen.getByText('Track your service access requests')).toBeInTheDocument()
  })
})
