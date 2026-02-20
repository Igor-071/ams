import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import type { Role } from '@/types/user.ts'
import { useAuthStore } from '@/stores/auth-store.ts'
import { MerchantDashboardPage } from '../pages/merchant-dashboard-page.tsx'

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
})
