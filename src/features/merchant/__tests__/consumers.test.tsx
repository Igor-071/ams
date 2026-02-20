import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import type { Role } from '@/types/user.ts'
import { useAuthStore } from '@/stores/auth-store.ts'
import { MerchantConsumersPage } from '../pages/merchant-consumers-page.tsx'
import { MerchantServiceConsumersPage } from '../pages/merchant-service-consumers-page.tsx'

function renderConsumersPage() {
  const router = createMemoryRouter(
    [{ path: '/merchant/consumers', element: <MerchantConsumersPage /> }],
    { initialEntries: ['/merchant/consumers'] },
  )
  return render(<RouterProvider router={router} />)
}

function renderServiceConsumers(serviceId: string) {
  const router = createMemoryRouter(
    [{ path: '/merchant/services/:serviceId/consumers', element: <MerchantServiceConsumersPage /> }],
    { initialEntries: [`/merchant/services/${serviceId}/consumers`] },
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

describe('Merchant Consumer Management', () => {
  beforeEach(() => {
    useAuthStore.getState().login(mockMerchant)
  })

  // AC-076: Consumers page shows API key usage across services
  it('renders consumers table with key usage across all services', () => {
    renderConsumersPage()
    expect(screen.getByRole('heading', { name: /Consumers/ })).toBeInTheDocument()
    // key-1 (Production Key) is in svc-1 and svc-2 — should appear for both
    expect(screen.getAllByText('Production Key').length).toBeGreaterThanOrEqual(1)
    // key-4 (Weather Integration) is in svc-1
    expect(screen.getByText('Weather Integration')).toBeInTheDocument()
    // Table headers
    expect(screen.getByText('Key Name')).toBeInTheDocument()
    expect(screen.getByText('Service')).toBeInTheDocument()
  })

  // AC-077: Per-service consumers page lists API keys for that service
  it('renders per-service consumer keys for svc-1', () => {
    renderServiceConsumers('svc-1')
    expect(screen.getByRole('heading', { name: /Weather API — Consumers/ })).toBeInTheDocument()
    // svc-1 has 4 keys: key-1, key-2, key-3, key-4
    expect(screen.getByText('Production Key')).toBeInTheDocument()
    expect(screen.getByText('Development Key')).toBeInTheDocument()
    expect(screen.getByText('Expired Key')).toBeInTheDocument()
    expect(screen.getByText('Weather Integration')).toBeInTheDocument()
  })

  // AC-078: Merchant can revoke an active API key
  it('shows revoke button for active keys and opens confirmation dialog', async () => {
    renderServiceConsumers('svc-1')
    const user = userEvent.setup()
    // Active keys have Revoke buttons
    const revokeButtons = screen.getAllByRole('button', { name: /Revoke/i })
    expect(revokeButtons.length).toBeGreaterThan(0)
    // Click first revoke button to open dialog
    await user.click(revokeButtons[0])
    expect(screen.getByText(/Revoke this API key/)).toBeInTheDocument()
    expect(screen.getByText(/immediately prevent/)).toBeInTheDocument()
    // Cancel button in dialog
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument()
  })
})
