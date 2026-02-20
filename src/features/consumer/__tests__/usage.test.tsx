import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import type { Role } from '@/types/user.ts'
import { useAuthStore } from '@/stores/auth-store.ts'
import { UsagePage } from '../pages/usage-page.tsx'

const mockConsumer = {
  id: 'user-consumer-1',
  email: 'alice@example.com',
  name: 'Alice Consumer',
  roles: ['consumer'] as Role[],
  activeRole: 'consumer' as const,
  status: 'active' as const,
  createdAt: '2025-01-01T00:00:00Z',
}

function renderUsagePage() {
  const router = createMemoryRouter(
    [{ path: '/dashboard/usage', element: <UsagePage /> }],
    { initialEntries: ['/dashboard/usage'] },
  )
  return render(<RouterProvider router={router} />)
}

describe('Usage Dashboard', () => {
  beforeEach(() => {
    useAuthStore.getState().login(mockConsumer)
  })

  // AC-059: Usage page renders with summary stats
  it('renders summary stat cards', () => {
    renderUsagePage()
    // Use getAllByText since labels can appear in both stat cards and table headers
    expect(screen.getAllByText('Total Requests').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Total Cost').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Avg Response Time')).toBeInTheDocument()
    expect(screen.getByText('Error Rate')).toBeInTheDocument()
  })

  // AC-060: Daily usage table displays data
  it('shows daily usage table sorted by most recent', () => {
    renderUsagePage()
    expect(screen.getByText('Daily Usage')).toBeInTheDocument()
    const rows = screen.getAllByRole('row')
    // Header rows (2 tables) + data rows
    expect(rows.length).toBeGreaterThan(2)

    // Check the daily usage table has the most recent date first
    // The daily usage table has dates like "2025-04-27"
    expect(screen.getByText('2025-04-27')).toBeInTheDocument()
    expect(screen.getByText('2025-04-14')).toBeInTheDocument()
  })

  // AC-061: Usage by service breakdown
  it('shows per-service usage breakdown', () => {
    renderUsagePage()
    expect(screen.getByText('By Service')).toBeInTheDocument()
    // consumer-1 has usage for Weather API (svc-1) and Geocoding API (svc-2)
    expect(screen.getByText('Weather API')).toBeInTheDocument()
    expect(screen.getByText('Geocoding API')).toBeInTheDocument()
  })
})
