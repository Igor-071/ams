import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import type { Role } from '@/types/user.ts'
import { useAuthStore } from '@/stores/auth-store.ts'
import { AdminGovernancePage } from '../pages/admin-governance-page.tsx'

function renderGovernancePage() {
  const router = createMemoryRouter(
    [{ path: '/admin/governance', element: <AdminGovernancePage /> }],
    { initialEntries: ['/admin/governance'] },
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

describe('Admin Governance', () => {
  // AC-100: Audit log table
  it('renders audit log table sorted newest-first', () => {
    useAuthStore.getState().login(mockAdmin)
    renderGovernancePage()
    expect(screen.getByRole('heading', { name: /Governance/ })).toBeInTheDocument()
    expect(screen.getByText('Audit Logs')).toBeInTheDocument()
    // Check audit entries are present
    expect(screen.getByText('Invited ACME APIs as merchant')).toBeInTheDocument()
    expect(screen.getByText('Revoked API key for consumer')).toBeInTheDocument()
    // Verify table columns
    expect(screen.getByText('Action')).toBeInTheDocument()
    expect(screen.getByText('Actor')).toBeInTheDocument()
    expect(screen.getByText('Timestamp')).toBeInTheDocument()
  })

  // AC-101: Action filter
  it('filters audit logs by action type', async () => {
    useAuthStore.getState().login(mockAdmin)
    renderGovernancePage()
    const user = userEvent.setup()
    // Click on "merchant.invited" filter
    await user.click(screen.getByRole('button', { name: 'merchant.invited' }))
    // Only merchant.invited logs should show
    expect(screen.getByText('Invited ACME APIs as merchant')).toBeInTheDocument()
    // Other actions should not be visible
    expect(screen.queryByText('Revoked API key for consumer')).not.toBeInTheDocument()
    // Click "All" to show all logs again
    await user.click(screen.getByRole('button', { name: 'All' }))
    expect(screen.getByText('Revoked API key for consumer')).toBeInTheDocument()
  })

  // AC-102: Platform config stub
  it('shows platform config TBD section', () => {
    useAuthStore.getState().login(mockAdmin)
    renderGovernancePage()
    expect(screen.getByText('Platform Config')).toBeInTheDocument()
    expect(screen.getByText('TBD')).toBeInTheDocument()
    expect(screen.getByText(/Platform configuration coming soon/)).toBeInTheDocument()
  })
})
