import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import type { Role } from '@/types/user.ts'
import { useAuthStore } from '@/stores/auth-store.ts'
import { AdminConsumersPage } from '../pages/admin-consumers-page.tsx'
import { AdminConsumerDetailPage } from '../pages/admin-consumer-detail-page.tsx'

function renderConsumersPage() {
  const router = createMemoryRouter(
    [
      { path: '/admin/consumers', element: <AdminConsumersPage /> },
      { path: '/admin/consumers/:consumerId', element: <AdminConsumerDetailPage /> },
    ],
    { initialEntries: ['/admin/consumers'] },
  )
  return render(<RouterProvider router={router} />)
}

function renderConsumerDetail(consumerId: string) {
  const router = createMemoryRouter(
    [{ path: '/admin/consumers/:consumerId', element: <AdminConsumerDetailPage /> }],
    { initialEntries: [`/admin/consumers/${consumerId}`] },
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

describe('Admin Consumer Management', () => {
  // AC-093: Consumer list table
  it('renders consumer list table with all consumers', () => {
    useAuthStore.getState().login(mockAdmin)
    renderConsumersPage()
    expect(screen.getByRole('heading', { name: /Consumers/ })).toBeInTheDocument()
    expect(screen.getByText('Alice Consumer')).toBeInTheDocument()
    expect(screen.getByText('Dave Developer')).toBeInTheDocument()
    expect(screen.getByText('Charlie Blocked')).toBeInTheDocument()
    // Table headers
    expect(screen.getByText('Organization')).toBeInTheDocument()
  })

  // AC-094: Consumer detail page
  it('renders consumer detail with profile, access requests, and usage', () => {
    useAuthStore.getState().login(mockAdmin)
    renderConsumerDetail('user-consumer-1')
    expect(screen.getByRole('heading', { name: /Alice Consumer/ })).toBeInTheDocument()
    expect(screen.getByText('consumer@startup.io')).toBeInTheDocument()
    expect(screen.getByText('Startup.io')).toBeInTheDocument()
    // Access requests
    expect(screen.getByText('Access Requests')).toBeInTheDocument()
    expect(screen.getByText('Weather API')).toBeInTheDocument()
    // Usage count
    expect(screen.getByText('Total Requests')).toBeInTheDocument()
  })

  // AC-095: Block consumer
  it('shows block button for active consumer and opens confirmation', async () => {
    useAuthStore.getState().login(mockAdmin)
    renderConsumerDetail('user-consumer-1')
    const user = userEvent.setup()
    const blockBtn = screen.getByRole('button', { name: /Block Consumer/i })
    expect(blockBtn).toBeInTheDocument()
    await user.click(blockBtn)
    expect(screen.getByText(/Block Consumer\?/)).toBeInTheDocument()
    expect(screen.getByText(/revoke all active API keys/)).toBeInTheDocument()
  })

  // AC-096: Approve/deny access requests
  it('shows approve and deny buttons for pending access requests', () => {
    useAuthStore.getState().login(mockAdmin)
    renderConsumerDetail('user-consumer-1')
    // ar-3 is pending (Sentiment Analysis API)
    expect(screen.getByText('Sentiment Analysis API')).toBeInTheDocument()
    const approveButtons = screen.getAllByRole('button', { name: /^Approve$/i })
    const denyButtons = screen.getAllByRole('button', { name: /^Deny$/i })
    expect(approveButtons.length).toBeGreaterThan(0)
    expect(denyButtons.length).toBeGreaterThan(0)
  })
})
