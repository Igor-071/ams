import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import type { Role } from '@/types/user.ts'
import { useAuthStore } from '@/stores/auth-store.ts'
import { MerchantUsageDetailPage } from '../pages/merchant-usage-detail-page.tsx'

function renderDetailPage(date: string) {
  const router = createMemoryRouter(
    [{ path: '/merchant/usage/:date', element: <MerchantUsageDetailPage /> }],
    { initialEntries: [`/merchant/usage/${date}`] },
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

describe('Merchant Usage Detail Page', () => {
  beforeEach(() => {
    useAuthStore.getState().login(mockMerchant)
  })

  it('renders page header with formatted date and total count', () => {
    renderDetailPage('2025-04-15')
    expect(
      screen.getByRole('heading', { name: /Usage — April 15, 2025/ }),
    ).toBeInTheDocument()
    expect(screen.getByText(/total requests/)).toBeInTheDocument()
  })

  it('displays table with all 7 column headers', () => {
    renderDetailPage('2025-04-15')
    expect(screen.getByText('Client ID')).toBeInTheDocument()
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

    // Should show pagination since daily records > 20
    expect(screen.getByText(/Page 1 of/)).toBeInTheDocument()

    const nextButton = screen.getByRole('button', { name: /Next/ })
    await user.click(nextButton)

    expect(screen.getByText(/Page 2 of/)).toBeInTheDocument()
  })

  it('shows empty state for invalid date', () => {
    renderDetailPage('not-a-date')
    expect(
      screen.getByText('No usage records found for this date.'),
    ).toBeInTheDocument()
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

    // Click again to reverse sort direction
    await user.click(statusCodeButton)
    // Still page 1 after re-sort
    expect(screen.getByText(/Page 1 of/)).toBeInTheDocument()
  })

  it('renders status code badges with correct colors', () => {
    renderDetailPage('2025-04-15')
    // All records on a typical day should have at least some 200s
    const badges = screen.getAllByText('200')
    expect(badges.length).toBeGreaterThan(0)
    // 200 badges should be green
    expect(badges[0].className).toContain('text-green-400')
  })
})
