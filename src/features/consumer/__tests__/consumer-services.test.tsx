import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import type { Role } from '@/types/user.ts'
import { useAuthStore } from '@/stores/auth-store.ts'
import { ConsumerServicesPage } from '../pages/consumer-services-page.tsx'
import { ConsumerServiceDetailPage } from '../pages/consumer-service-detail-page.tsx'

function renderServicesPage() {
  const router = createMemoryRouter(
    [
      { path: '/dashboard/services', element: <ConsumerServicesPage /> },
      { path: '/dashboard/services/:serviceId', element: <ConsumerServiceDetailPage /> },
      { path: '/marketplace/:serviceId', element: <div>Marketplace Detail</div> },
    ],
    { initialEntries: ['/dashboard/services'] },
  )
  return render(<RouterProvider router={router} />)
}

function renderServiceDetail(serviceId: string) {
  const router = createMemoryRouter(
    [{ path: '/dashboard/services/:serviceId', element: <ConsumerServiceDetailPage /> }],
    { initialEntries: [`/dashboard/services/${serviceId}`] },
  )
  return render(<RouterProvider router={router} />)
}

const mockConsumer = {
  id: 'user-consumer-1',
  email: 'consumer@startup.io',
  name: 'Alice Consumer',
  roles: ['consumer'] as Role[],
  activeRole: 'consumer' as const,
  status: 'active' as const,
  createdAt: '2025-01-01T00:00:00Z',
}

describe('Consumer Services', () => {
  // AC-109: Consumer services page lists approved services
  it('renders table of approved services', () => {
    useAuthStore.getState().login(mockConsumer)
    renderServicesPage()
    expect(screen.getByRole('heading', { name: /My Services/ })).toBeInTheDocument()
    // user-consumer-1 has approved access to svc-1 (Weather API) and svc-2 (Geocoding API)
    expect(screen.getByText('Weather API')).toBeInTheDocument()
    expect(screen.getByText('Geocoding API')).toBeInTheDocument()
    // Table shows merchant, type, category (both services from ACME)
    const merchantCells = screen.getAllByText('ACME APIs')
    expect(merchantCells.length).toBeGreaterThanOrEqual(1)
  })

  it('shows each service with type and category', () => {
    useAuthStore.getState().login(mockConsumer)
    renderServicesPage()
    const apiBadges = screen.getAllByText('API')
    expect(apiBadges.length).toBeGreaterThanOrEqual(1)
    // Both services have category "Data"
    const categories = screen.getAllByText('Data')
    expect(categories.length).toBeGreaterThanOrEqual(1)
  })

  // AC-110: Consumer service detail shows per-service usage
  it('renders service detail with usage stats', () => {
    useAuthStore.getState().login(mockConsumer)
    renderServiceDetail('svc-1')
    expect(screen.getByRole('heading', { name: /Weather API/ })).toBeInTheDocument()
    expect(screen.getByText('ACME APIs')).toBeInTheDocument()
    // Stats
    expect(screen.getByText('Total Requests')).toBeInTheDocument()
    expect(screen.getByText('Avg Response Time')).toBeInTheDocument()
    // Recent usage table
    expect(screen.getByText('Recent Usage')).toBeInTheDocument()
  })

  it('shows usage records in the detail page', () => {
    useAuthStore.getState().login(mockConsumer)
    renderServiceDetail('svc-1')
    // user-consumer-1 has multiple usage records for svc-1
    expect(screen.getByText('Timestamp')).toBeInTheDocument()
    expect(screen.getByText('Response Time')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
  })

  // Pending access requests visible on services page
  it('shows pending access requests above approved services', () => {
    useAuthStore.getState().login(mockConsumer)
    renderServicesPage()
    // user-consumer-1 has ar-3 pending for Sentiment Analysis API
    expect(screen.getByText('Pending Requests')).toBeInTheDocument()
    expect(screen.getByText('Sentiment Analysis API')).toBeInTheDocument()
    // Pending badge
    const pendingBadges = screen.getAllByText('Pending')
    expect(pendingBadges.length).toBeGreaterThanOrEqual(1)
  })
})
