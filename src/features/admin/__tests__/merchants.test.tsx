import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import type { Role } from '@/types/user.ts'
import { useAuthStore } from '@/stores/auth-store.ts'
import { AdminMerchantsPage } from '../pages/admin-merchants-page.tsx'
import { AdminMerchantDetailPage } from '../pages/admin-merchant-detail-page.tsx'

function renderMerchantsPage() {
  const router = createMemoryRouter(
    [
      { path: '/admin/merchants', element: <AdminMerchantsPage /> },
      { path: '/admin/merchants/:merchantId', element: <AdminMerchantDetailPage /> },
    ],
    { initialEntries: ['/admin/merchants'] },
  )
  return render(<RouterProvider router={router} />)
}

function renderMerchantDetail(merchantId: string) {
  const router = createMemoryRouter(
    [{ path: '/admin/merchants/:merchantId', element: <AdminMerchantDetailPage /> }],
    { initialEntries: [`/admin/merchants/${merchantId}`] },
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

describe('Admin Merchant Management', () => {
  // AC-089: Merchant list table
  it('renders merchant list table with all merchants', () => {
    useAuthStore.getState().login(mockAdmin)
    renderMerchantsPage()
    expect(screen.getByRole('heading', { name: /Merchants/ })).toBeInTheDocument()
    expect(screen.getByText('James Merchant')).toBeInTheDocument()
    expect(screen.getByText('ACME APIs')).toBeInTheDocument()
    expect(screen.getByText('Maria DataFlow')).toBeInTheDocument()
    expect(screen.getByText('Bob Suspended')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Invite Merchant/i })).toBeInTheDocument()
  })

  // AC-090: Invite merchant dialog
  it('opens invite dialog and generates invite code', async () => {
    useAuthStore.getState().login(mockAdmin)
    renderMerchantsPage()
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /Invite Merchant/i }))
    expect(screen.getByText('Invite Merchant', { selector: '[data-slot="dialog-title"]' })).toBeInTheDocument()
    await user.type(screen.getByLabelText(/Email/), 'new@merchant.com')
    await user.click(screen.getByRole('button', { name: /Generate Invite/i }))
    // After generation, invite code and link should be visible
    // Both code and link contain INV-, so use getAllByText
    const invTexts = screen.getAllByText(/INV-/)
    expect(invTexts.length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/\/register\/merchant/)).toBeInTheDocument()
  })

  // AC-091: Merchant detail page
  it('renders merchant detail with profile and services', () => {
    useAuthStore.getState().login(mockAdmin)
    renderMerchantDetail('user-merchant-1')
    expect(screen.getByRole('heading', { name: /James Merchant/ })).toBeInTheDocument()
    expect(screen.getByText('ACME APIs')).toBeInTheDocument()
    expect(screen.getByText('merchant@acme.com')).toBeInTheDocument()
    // Services list
    expect(screen.getByText('Weather API')).toBeInTheDocument()
    expect(screen.getByText('Geocoding API')).toBeInTheDocument()
  })

  // AC-092: Suspend merchant
  it('shows suspend button for active merchant and opens confirmation', async () => {
    useAuthStore.getState().login(mockAdmin)
    renderMerchantDetail('user-merchant-1')
    const user = userEvent.setup()
    const suspendBtn = screen.getByRole('button', { name: /Suspend Merchant/i })
    expect(suspendBtn).toBeInTheDocument()
    await user.click(suspendBtn)
    expect(screen.getByText(/Suspend Merchant\?/)).toBeInTheDocument()
    expect(screen.getByText(/prevent the merchant/)).toBeInTheDocument()
  })
})
