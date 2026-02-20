import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import type { Role } from '@/types/user.ts'
import { useAuthStore } from '@/stores/auth-store.ts'
import { AdminDashboardPage } from '../pages/admin-dashboard-page.tsx'

function renderWithRouter() {
  const router = createMemoryRouter(
    [{ path: '/admin', element: <AdminDashboardPage /> }],
    { initialEntries: ['/admin'] },
  )
  return render(<RouterProvider router={router} />)
}

const mockAdmin = {
  id: 'user-admin-1',
  email: 'admin@ams.io',
  name: 'Sarah Admin',
  roles: ['admin'] as Role[],
  activeRole: 'admin' as const,
  status: 'active' as const,
  createdAt: '2025-01-01T00:00:00Z',
}

describe('Admin Dashboard Overview', () => {
  // AC-086: Dashboard KPI stat cards
  it('renders heading and 4 KPI stat cards', () => {
    useAuthStore.getState().login(mockAdmin)
    renderWithRouter()
    expect(screen.getByRole('heading', { name: /Admin Dashboard/ })).toBeInTheDocument()
    expect(screen.getByText('Total Merchants')).toBeInTheDocument()
    expect(screen.getByText('Total Consumers')).toBeInTheDocument()
    expect(screen.getByText('Pending Approvals')).toBeInTheDocument()
    expect(screen.getByText('Active Services')).toBeInTheDocument()
  })

  // AC-087: Pending items section
  it('shows pending items section with pending services and access requests', () => {
    useAuthStore.getState().login(mockAdmin)
    renderWithRouter()
    expect(screen.getByText('Pending Items')).toBeInTheDocument()
    // svc-5 (Auth Middleware) is pending_approval
    expect(screen.getByText('Auth Middleware')).toBeInTheDocument()
    expect(screen.getByText('Service Approval')).toBeInTheDocument()
    // ar-3 is a pending access request for Sentiment Analysis API
    expect(screen.getByText('Sentiment Analysis API')).toBeInTheDocument()
    expect(screen.getByText('Access Request')).toBeInTheDocument()
  })

  // AC-088: Quick action links
  it('shows quick action links to management pages', () => {
    useAuthStore.getState().login(mockAdmin)
    renderWithRouter()
    expect(screen.getByText('Quick Actions')).toBeInTheDocument()
    const merchantsLink = screen.getByRole('link', { name: /Merchants/i })
    const consumersLink = screen.getByRole('link', { name: /Consumers/i })
    const servicesLink = screen.getByRole('link', { name: /Services/i })
    const governanceLink = screen.getByRole('link', { name: /Governance/i })
    expect(merchantsLink).toHaveAttribute('href', '/admin/merchants')
    expect(consumersLink).toHaveAttribute('href', '/admin/consumers')
    expect(servicesLink).toHaveAttribute('href', '/admin/services')
    expect(governanceLink).toHaveAttribute('href', '/admin/governance')
  })
})
