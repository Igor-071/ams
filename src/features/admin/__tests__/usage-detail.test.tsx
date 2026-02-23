import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import type { Role } from '@/types/user.ts'
import { useAuthStore } from '@/stores/auth-store.ts'
import { AdminUsageDetailPage } from '../pages/admin-usage-detail-page.tsx'

function renderDetailPage(date: string) {
  const router = createMemoryRouter(
    [{ path: '/admin/usage/:date', element: <AdminUsageDetailPage /> }],
    { initialEntries: [`/admin/usage/${date}`] },
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

describe('Admin Usage Detail Page', () => {
  beforeEach(() => {
    useAuthStore.getState().login(mockAdmin)
  })

  it('renders formatted date heading and total count', () => {
    renderDetailPage('2025-04-15')
    expect(
      screen.getByRole('heading', { name: /Usage — April 15, 2025/ }),
    ).toBeInTheDocument()
    expect(screen.getByText(/total requests/)).toBeInTheDocument()
  })

  it('displays 8 column headers including Merchant', () => {
    renderDetailPage('2025-04-15')
    expect(screen.getByText('Consumer')).toBeInTheDocument()
    expect(screen.getByText('Merchant')).toBeInTheDocument()
    expect(screen.getByText('Request Size')).toBeInTheDocument()
    expect(screen.getByText('Response Size')).toBeInTheDocument()
    expect(screen.getByText('Timestamp')).toBeInTheDocument()
    expect(screen.getByText('Status Code')).toBeInTheDocument()
    expect(screen.getByText('Service Name')).toBeInTheDocument()
    expect(screen.getByText('Service Type')).toBeInTheDocument()
  })

  it('shows pagination and navigates to page 2', async () => {
    const user = userEvent.setup()
    renderDetailPage('2025-04-15')

    expect(screen.getByText(/Page 1 of/)).toBeInTheDocument()

    const nextButton = screen.getByRole('button', { name: /Next/ })
    await user.click(nextButton)

    expect(screen.getByText(/Page 2 of/)).toBeInTheDocument()
  })

  it('sort resets to page 1', async () => {
    const user = userEvent.setup()
    renderDetailPage('2025-04-15')

    // Navigate to page 2 first
    const nextButton = screen.getByRole('button', { name: /Next/ })
    await user.click(nextButton)
    expect(screen.getByText(/Page 2 of/)).toBeInTheDocument()

    // Click Merchant header to sort — should reset to page 1
    const merchantButton = screen.getByRole('button', { name: /Merchant/ })
    await user.click(merchantButton)
    expect(screen.getByText(/Page 1 of/)).toBeInTheDocument()
  })

  it('shows empty state for invalid date', () => {
    renderDetailPage('not-a-date')
    expect(
      screen.getByText('No usage records found for this date.'),
    ).toBeInTheDocument()
  })
})
