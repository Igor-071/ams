import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import type { Role } from '@/types/user.ts'
import { useAuthStore } from '@/stores/auth-store.ts'
import { MerchantServiceDetailPage } from '../pages/merchant-service-detail-page.tsx'

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
  createdAt: '2025-01-01T00:00:00Z',
}

describe('Consumption Endpoint Simulation', () => {
  beforeEach(() => {
    useAuthStore.getState().login(mockMerchant)
  })

  // AC-104: Simulator form renders on merchant service detail
  it('renders simulator form on API-type service detail', () => {
    renderServiceDetail('svc-1') // Weather API (type: api)
    expect(screen.getByText('Try Consumption Endpoint')).toBeInTheDocument()
    expect(screen.getByLabelText('API Key')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Simulate/ })).toBeInTheDocument()
  })

  // AC-108: Usage pipeline visualization
  it('shows usage pipeline section on API-type service', () => {
    renderServiceDetail('svc-1')
    expect(screen.getByText('Usage Pipeline')).toBeInTheDocument()
    expect(screen.getByText('Aggregate Usage')).toBeInTheDocument()
    expect(screen.getByText('Update Billing')).toBeInTheDocument()
    expect(screen.getByText('Feed Dashboards')).toBeInTheDocument()
    expect(screen.getByText('Trigger Alerts')).toBeInTheDocument()
  })

  // AC-105: Validation step results show pass/fail indicators
  it('shows pass/fail indicators after simulation with invalid key', async () => {
    renderServiceDetail('svc-1')
    const user = userEvent.setup()
    await user.type(screen.getByLabelText('API Key'), 'invalid-key-value')
    await user.click(screen.getByRole('button', { name: /Simulate/ }))
    await waitFor(() => {
      // Result summary line is unique
      expect(screen.getByText(/401 — Invalid API key/)).toBeInTheDocument()
    }, { timeout: 2000 })
    // First step failed, others should be skipped
    const skipped = screen.getAllByText('Skipped')
    expect(skipped.length).toBe(5)
  })

  // AC-106: Invalid API key returns 401
  it('returns 401 for invalid API key', async () => {
    renderServiceDetail('svc-1')
    const user = userEvent.setup()
    await user.type(screen.getByLabelText('API Key'), 'bogus-key')
    await user.click(screen.getByRole('button', { name: /Simulate/ }))
    await waitFor(() => {
      expect(screen.getByText(/401 — Invalid API key/)).toBeInTheDocument()
    }, { timeout: 2000 })
  })

  // AC-106: Expired key returns 403
  it('returns 403 for expired API key', async () => {
    renderServiceDetail('svc-1')
    const user = userEvent.setup()
    // key-3 is expired and authorized for svc-1
    await user.type(
      screen.getByLabelText('API Key'),
      'ams_live_x1y2z3a4b5c6d7e8f9g0h1i2j3k4l5m6',
    )
    await user.click(screen.getByRole('button', { name: /Simulate/ }))
    await waitFor(() => {
      expect(screen.getByText(/403 — API key expired/)).toBeInTheDocument()
    }, { timeout: 2000 })
  })

  // AC-107: Successful simulation creates usage record
  it('shows 200 success for valid active key', async () => {
    renderServiceDetail('svc-1')
    const user = userEvent.setup()
    // key-1 is active and authorized for svc-1
    await user.type(
      screen.getByLabelText('API Key'),
      'ams_live_k1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6',
    )
    await user.click(screen.getByRole('button', { name: /Simulate/ }))
    await waitFor(() => {
      expect(screen.getByText(/200 — Success/)).toBeInTheDocument()
    }, { timeout: 2000 })
    // All 6 OK indicators
    const okIndicators = screen.getAllByText('OK')
    expect(okIndicators.length).toBe(6)
  })
})
