import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { PublicLayout } from '@/components/layout/public-layout.tsx'
import { ServiceDetailPage } from '../pages/service-detail-page.tsx'
import { CatalogPage } from '../pages/catalog-page.tsx'
import { useAuthStore } from '@/stores/auth-store.ts'

vi.mock('@/mocks/delay.ts', () => ({
  mockDelay: () => Promise.resolve(),
}))

function renderServiceDetail(serviceId: string) {
  const router = createMemoryRouter(
    [
      {
        element: <PublicLayout />,
        children: [
          { path: 'marketplace', element: <CatalogPage /> },
          { path: 'marketplace/:serviceId', element: <ServiceDetailPage /> },
        ],
      },
    ],
    { initialEntries: [`/marketplace/${serviceId}`] },
  )
  return render(<RouterProvider router={router} />)
}

describe('Service Detail Page', () => {
  beforeEach(() => {
    useAuthStore.getState().logout()
  })

  // AC-036: Full metadata display
  it('renders service name, description, type badge, merchant, and tags', () => {
    renderServiceDetail('svc-1')

    expect(screen.getByRole('heading', { name: 'Weather API' })).toBeInTheDocument()
    expect(screen.getByText(/real-time weather data/i)).toBeInTheDocument()
    expect(screen.getByText('API')).toBeInTheDocument()
    expect(screen.getByText(/ACME APIs/)).toBeInTheDocument()
    expect(screen.getByText('Data')).toBeInTheDocument()
    // Tags
    expect(screen.getByText('weather')).toBeInTheDocument()
    expect(screen.getByText('geolocation')).toBeInTheDocument()
  })

  // AC-037: Pricing - per request
  it('displays per-request pricing with free tier', () => {
    renderServiceDetail('svc-1')

    expect(screen.getByText(/\$0\.001/)).toBeInTheDocument()
    expect(screen.getByText(/1,000 requests free/i)).toBeInTheDocument()
  })

  // AC-037: Pricing - tiered
  it('displays tiered pricing with tier table', () => {
    renderServiceDetail('svc-4')

    expect(screen.getByText('Tiered pricing')).toBeInTheDocument()
    expect(screen.getByText(/1,000 req/)).toBeInTheDocument()
    expect(screen.getByText('$0.005/req')).toBeInTheDocument()
  })

  // AC-037: Pricing - flat
  it('displays flat rate pricing', () => {
    renderServiceDetail('svc-3')

    expect(screen.getByText('Flat rate')).toBeInTheDocument()
  })

  // AC-038: Rate limit info
  it('displays rate limit information', () => {
    renderServiceDetail('svc-1')

    expect(screen.getByText('100 requests/minute')).toBeInTheDocument()
  })

  it('displays unlimited when rate limit is 0', () => {
    renderServiceDetail('svc-3')

    expect(screen.getByText('Unlimited')).toBeInTheDocument()
  })

  // AC-039: Documentation link
  it('shows documentation link when available', () => {
    renderServiceDetail('svc-1')

    const docLink = screen.getByText('View Documentation')
    expect(docLink).toBeInTheDocument()
    expect(docLink.closest('a')).toHaveAttribute('href', 'https://docs.acme.com/weather')
  })

  it('does not show documentation link when not available', () => {
    renderServiceDetail('svc-3') // Stream Processor has no doc URL

    expect(screen.queryByText('View Documentation')).not.toBeInTheDocument()
  })

  // AC-040: Back navigation
  it('has back to marketplace link', async () => {
    const user = userEvent.setup()

    renderServiceDetail('svc-1')

    const backLink = screen.getByText('Back to Marketplace')
    expect(backLink).toBeInTheDocument()

    await user.click(backLink)

    // Should navigate back to catalog
    expect(screen.getByRole('heading', { name: /marketplace/i })).toBeInTheDocument()
  })

  // AC-041: Non-existent service
  it('shows not found state for invalid service ID', () => {
    renderServiceDetail('invalid-id')

    expect(screen.getByText('Service not found')).toBeInTheDocument()
    expect(screen.getByText('Back to Marketplace')).toBeInTheDocument()
  })

  // AC-041: Non-active service treated as not found
  it('shows not found for non-active service', () => {
    renderServiceDetail('svc-5') // pending_approval

    expect(screen.getByText('Service not found')).toBeInTheDocument()
  })
})
