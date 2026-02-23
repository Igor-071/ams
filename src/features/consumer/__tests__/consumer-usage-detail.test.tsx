import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import type { Role } from '@/types/user.ts'
import { useAuthStore } from '@/stores/auth-store.ts'
import { ConsumerUsageDetailPage } from '../pages/consumer-usage-detail-page.tsx'

const mockConsumer = {
  id: 'user-consumer-1',
  email: 'alice@example.com',
  name: 'Alice Consumer',
  roles: ['consumer'] as Role[],
  activeRole: 'consumer' as const,
  status: 'active' as const,
  createdAt: '2025-01-01T00:00:00Z',
}

function renderDetailPage(date: string) {
  const router = createMemoryRouter(
    [{ path: '/dashboard/usage/:date', element: <ConsumerUsageDetailPage /> }],
    { initialEntries: [`/dashboard/usage/${date}`] },
  )
  return render(<RouterProvider router={router} />)
}

describe('Consumer Usage Detail Page', () => {
  beforeEach(() => {
    useAuthStore.getState().login(mockConsumer)
  })

  it('renders page header with formatted date and total count', () => {
    renderDetailPage('2025-04-15')
    expect(
      screen.getByRole('heading', { name: /Usage — April 15, 2025/ }),
    ).toBeInTheDocument()
    expect(screen.getByText(/total requests/)).toBeInTheDocument()
  })

  it('displays table with API Key column instead of Client ID', () => {
    renderDetailPage('2025-04-15')
    expect(screen.getByText('API Key')).toBeInTheDocument()
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

  it('sorts table when column header is clicked', async () => {
    const user = userEvent.setup()
    renderDetailPage('2025-04-15')

    // Navigate to page 2 first
    const nextButton = screen.getByRole('button', { name: /Next/ })
    await user.click(nextButton)
    expect(screen.getByText(/Page 2 of/)).toBeInTheDocument()

    // Click Status Code header to sort — should reset to page 1
    const statusCodeButton = screen.getByRole('button', { name: /Status Code/ })
    await user.click(statusCodeButton)
    expect(screen.getByText(/Page 1 of/)).toBeInTheDocument()
  })

  it('shows empty state for invalid date', () => {
    renderDetailPage('not-a-date')
    expect(
      screen.getByText('No usage records found for this date.'),
    ).toBeInTheDocument()
  })
})
