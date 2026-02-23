import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import type { Role } from '@/types/user.ts'
import { useAuthStore } from '@/stores/auth-store.ts'
import { MerchantServicesPage } from '../pages/merchant-services-page.tsx'
import { MerchantServiceNewPage } from '../pages/merchant-service-new-page.tsx'
import { MerchantServiceDetailPage } from '../pages/merchant-service-detail-page.tsx'

function renderServicesPage() {
  const router = createMemoryRouter(
    [
      { path: '/merchant/services', element: <MerchantServicesPage /> },
      { path: '/merchant/services/new', element: <MerchantServiceNewPage /> },
      { path: '/merchant/services/:serviceId', element: <MerchantServiceDetailPage /> },
    ],
    { initialEntries: ['/merchant/services'] },
  )
  return render(<RouterProvider router={router} />)
}

function renderServiceNew() {
  const router = createMemoryRouter(
    [
      { path: '/merchant/services/new', element: <MerchantServiceNewPage /> },
      { path: '/merchant/services/:serviceId', element: <MerchantServiceDetailPage /> },
    ],
    { initialEntries: ['/merchant/services/new'] },
  )
  return render(<RouterProvider router={router} />)
}

function renderServiceDetail(serviceId: string) {
  const router = createMemoryRouter(
    [{ path: '/merchant/services/:serviceId', element: <MerchantServiceDetailPage /> }],
    { initialEntries: [`/merchant/services/${serviceId}`] },
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

describe('Merchant Service Management', () => {
  beforeEach(() => {
    useAuthStore.getState().login(mockMerchant)
  })

  // AC-070: Services list table displays merchant services with visibility column
  it('renders service table with merchant services and visibility column', () => {
    renderServicesPage()
    expect(screen.getByRole('heading', { name: /Services/ })).toBeInTheDocument()
    expect(screen.getByText('Weather API')).toBeInTheDocument()
    expect(screen.getByText('Geocoding API')).toBeInTheDocument()
    expect(screen.getByText('Image Recognition API')).toBeInTheDocument()
    // "New Service" button exists
    expect(screen.getByRole('link', { name: /New Service/i })).toBeInTheDocument()
    // Visibility column header
    expect(screen.getByText('Visibility')).toBeInTheDocument()
    // All merchant-1 services are public
    expect(screen.getAllByText('Public').length).toBeGreaterThan(0)
  })

  // AC-071: Create new service form renders with required fields
  it('renders create service form with type toggle, visibility toggle, and required fields', () => {
    renderServiceNew()
    expect(screen.getByRole('heading', { name: /New Service/ })).toBeInTheDocument()
    expect(screen.getByLabelText(/Name/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Description/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Category/)).toBeInTheDocument()
    // Type toggle buttons
    expect(screen.getByRole('button', { name: 'API' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'DOCKER' })).toBeInTheDocument()
    // Visibility toggle buttons
    expect(screen.getByRole('button', { name: /Public/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Private/ })).toBeInTheDocument()
  })

  // AC-072: API type shows pricing, rate limit, and endpoint fields
  it('shows API-specific fields when API type is selected', () => {
    renderServiceNew()
    // API is selected by default
    expect(screen.getByLabelText(/Rate Limit/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Endpoint Base URL/)).toBeInTheDocument()
    // Pricing model buttons
    expect(screen.getByRole('button', { name: 'free' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'per request' })).toBeInTheDocument()
  })

  // AC-073: Docker type shows license field, hides API fields
  it('shows Docker-specific fields when Docker type is selected', async () => {
    renderServiceNew()
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'DOCKER' }))
    expect(screen.getByLabelText(/License/)).toBeInTheDocument()
    // API-specific fields should be gone
    expect(screen.queryByLabelText(/Rate Limit/)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/Endpoint Base URL/)).not.toBeInTheDocument()
  })

  // AC-074: Service detail page shows metadata
  it('renders service detail page with metadata', () => {
    renderServiceDetail('svc-1')
    expect(screen.getByRole('heading', { name: /Weather API/ })).toBeInTheDocument()
    expect(screen.getByText('Data')).toBeInTheDocument() // category
    expect(screen.getByText('$0.001/req')).toBeInTheDocument() // pricing
    expect(screen.getByText('100 req/min')).toBeInTheDocument() // rate limit
  })

  // AC-075: API service detail shows consumption endpoint docs
  it('shows consumption endpoint docs for API-type service', () => {
    renderServiceDetail('svc-1')
    expect(screen.getByText('Consumption Endpoint')).toBeInTheDocument()
    expect(screen.getByText('POST /api/consume')).toBeInTheDocument()
    expect(screen.getByText('Validation Chain')).toBeInTheDocument()
    expect(screen.getByText('Error Codes')).toBeInTheDocument()
    // Validation steps
    expect(screen.getByText('API Key Validation')).toBeInTheDocument()
    // "Rate Limit" appears in both service detail and validation chain
    expect(screen.getAllByText('Rate Limit').length).toBeGreaterThanOrEqual(1)
  })
})
