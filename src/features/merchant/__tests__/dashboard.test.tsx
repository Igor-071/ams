import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import type { Role } from '@/types/user.ts'
import { useAuthStore } from '@/stores/auth-store.ts'
import { MerchantDashboardPage } from '../pages/merchant-dashboard-page.tsx'

vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts')
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: 800, height: 300 }}>{children}</div>
    ),
  }
})

function renderWithRouter(initialEntry = '/merchant') {
  const router = createMemoryRouter(
    [{ path: '/merchant', element: <MerchantDashboardPage /> }],
    { initialEntries: [initialEntry] },
  )
  return render(<RouterProvider router={router} />)
}

const mockMerchant = {
  id: 'user-merchant-1',
  email: 'merchant@acme.com',
  name: 'James Merchant',
  roles: ['merchant'] as Role[],
  activeRole: 'merchant' as const,
  status: 'active' as const,
  createdAt: '2025-02-15T00:00:00Z',
}

describe('Merchant Dashboard Overview', () => {
  beforeEach(() => {
    useAuthStore.getState().login(mockMerchant)
  })

  // AC-067: Dashboard renders with KPI stat cards
  it('renders heading and 4 stat cards', () => {
    renderWithRouter()
    expect(screen.getByRole('heading', { name: /Dashboard/ })).toBeInTheDocument()
    expect(screen.getByText('Total Services')).toBeInTheDocument()
    expect(screen.getByText('Active Consumers')).toBeInTheDocument()
    expect(screen.getByText('Total Requests')).toBeInTheDocument()
    expect(screen.getByText('Revenue')).toBeInTheDocument()
  })

  // AC-068: Stat values reflect merchant data
  it('shows correct aggregated values for merchant-1', () => {
    renderWithRouter()
    // merchant-1 has 3 services (svc-1, svc-2, svc-6)
    expect(screen.getByText('3')).toBeInTheDocument()
    // Revenue: inv-1 ($6.28) + inv-2 ($8.01) = $14.29
    expect(screen.getByText('$14.29')).toBeInTheDocument()
  })

  // AC-069: Quick actions link to Services and Invoices
  it('shows quick action links for Services and Invoices', () => {
    renderWithRouter()
    expect(screen.getByText('Quick Actions')).toBeInTheDocument()
    const servicesLink = screen.getByRole('link', { name: /Services/i })
    const invoicesLink = screen.getByRole('link', { name: /Invoices/i })
    expect(servicesLink).toHaveAttribute('href', '/merchant/services')
    expect(invoicesLink).toHaveAttribute('href', '/merchant/invoices')
  })

  // Access Requests section visible on merchant dashboard
  it('shows access requests section with heading', () => {
    renderWithRouter()
    expect(screen.getByText('Access Requests')).toBeInTheDocument()
  })

  it('shows recently resolved access requests for merchant-1', () => {
    renderWithRouter()
    // merchant-1 has services svc-1, svc-2, svc-6
    // ar-1 (Alice, svc-1, approved), ar-2 (Alice, svc-2, approved), ar-4 (Dave, svc-1, approved)
    expect(screen.getByText('Recently Resolved')).toBeInTheDocument()
  })

  it('renders Service Activity chart', () => {
    renderWithRouter()
    expect(screen.getByText('Service Activity')).toBeInTheDocument()
    expect(screen.getByTestId('service-activity-chart')).toBeInTheDocument()
  })

  it('renders Revenue Trend chart', () => {
    renderWithRouter()
    expect(screen.getByText('Revenue Trend')).toBeInTheDocument()
    expect(screen.getByTestId('revenue-trend-chart')).toBeInTheDocument()
  })

  it('renders Service Status chart', () => {
    renderWithRouter()
    expect(screen.getByText('Service Status')).toBeInTheDocument()
    expect(screen.getByTestId('service-status-chart')).toBeInTheDocument()
  })

  it('renders Top Services chart', () => {
    renderWithRouter()
    expect(screen.getByText('Top Services')).toBeInTheDocument()
    expect(screen.getByTestId('top-services-chart')).toBeInTheDocument()
  })
})

describe('Merchant Dashboard — Access Requests (merchant-2)', () => {
  const mockMerchant2 = {
    id: 'user-merchant-2',
    email: 'merchant@dataflow.io',
    name: 'Maria DataFlow',
    roles: ['merchant'] as Role[],
    activeRole: 'merchant' as const,
    status: 'active' as const,
    createdAt: '2025-02-20T00:00:00Z',
  }

  beforeEach(() => {
    useAuthStore.getState().login(mockMerchant2)
  })

  it('shows pending access requests for merchant-2 services', () => {
    renderWithRouter()
    // merchant-2 has svc-3, svc-4
    // ar-3: Alice Consumer, svc-4, pending
    expect(screen.getByText('Access Requests')).toBeInTheDocument()
    expect(screen.getByText('Alice Consumer')).toBeInTheDocument()
    expect(screen.getByText(/1 pending/)).toBeInTheDocument()
  })
})
