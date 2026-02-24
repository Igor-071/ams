import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import type { Role } from '@/types/user.ts'
import { useAuthStore } from '@/stores/auth-store.ts'
import { AdminMerchantDetailPage } from '../pages/admin-merchant-detail-page.tsx'
import { AdminMerchantsPage } from '../pages/admin-merchants-page.tsx'
import {
  getMerchantProfile,
  flagMerchantForReview,
  blockMerchantSubscriptions,
  createAccessRequest,
} from '@/mocks/handlers.ts'
import { mockMerchantProfiles } from '@/mocks/data/users.ts'

function renderMerchantDetail(merchantId: string) {
  const router = createMemoryRouter(
    [{ path: '/admin/merchants/:merchantId', element: <AdminMerchantDetailPage /> }],
    { initialEntries: [`/admin/merchants/${merchantId}`] },
  )
  return render(<RouterProvider router={router} />)
}

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

const mockAdmin = {
  id: 'user-admin-1',
  email: 'admin@ams.io',
  name: 'Sarah Admin',
  roles: ['admin'] as Role[],
  activeRole: 'admin' as const,
  status: 'active' as const,
  createdAt: '2025-01-01T00:00:00Z',
}

describe('Admin Compliance Controls', () => {
  beforeEach(() => {
    useAuthStore.getState().login(mockAdmin)
    // Reset compliance flags
    for (const profile of mockMerchantProfiles) {
      profile.flaggedForReview = false
      profile.subscriptionsBlocked = false
    }
  })

  // AC-149: MerchantProfile extended with flaggedForReview and subscriptionsBlocked
  it('merchant profile has flaggedForReview and subscriptionsBlocked fields', () => {
    const profile = getMerchantProfile('user-merchant-1')
    expect(profile).toBeDefined()
    expect(profile!.flaggedForReview).toBe(false)
    expect(profile!.subscriptionsBlocked).toBe(false)
  })

  // AC-150: Admin merchant detail compliance controls card
  it('shows Compliance Controls card with toggles on merchant detail', () => {
    renderMerchantDetail('user-merchant-1')
    expect(screen.getByText('Compliance Controls')).toBeInTheDocument()
    expect(screen.getByText('Flagged for Review')).toBeInTheDocument()
    expect(screen.getByText('Block Subscriptions')).toBeInTheDocument()
  })

  // AC-151: flagMerchantForReview handler
  it('toggles flaggedForReview via handler', () => {
    flagMerchantForReview('user-merchant-1', true)
    const profile = getMerchantProfile('user-merchant-1')
    expect(profile!.flaggedForReview).toBe(true)
    flagMerchantForReview('user-merchant-1', false)
    expect(getMerchantProfile('user-merchant-1')!.flaggedForReview).toBe(false)
  })

  // AC-152: blockMerchantSubscriptions handler
  it('toggles subscriptionsBlocked via handler', () => {
    blockMerchantSubscriptions('user-merchant-1', true)
    const profile = getMerchantProfile('user-merchant-1')
    expect(profile!.subscriptionsBlocked).toBe(true)
    blockMerchantSubscriptions('user-merchant-1', false)
    expect(getMerchantProfile('user-merchant-1')!.subscriptionsBlocked).toBe(false)
  })

  // AC-153: Flagged merchants show warning badge in merchants list
  it('shows flagged warning icon for flagged merchants in list', () => {
    flagMerchantForReview('user-merchant-1', true)
    renderMerchantsPage()
    expect(screen.getByTestId('flagged-user-merchant-1')).toBeInTheDocument()
  })

  // AC-154: Merchants page status filter
  it('filters merchants by status on merchants page', async () => {
    renderMerchantsPage()
    const user = userEvent.setup()
    const select = screen.getByRole('combobox', { name: /Filter by status/i })
    // Select "Suspended"
    await user.selectOptions(select, 'suspended')
    // Should show suspended merchant but not active ones
    expect(screen.getByText('Bob Suspended')).toBeInTheDocument()
    expect(screen.queryByText('James Merchant')).not.toBeInTheDocument()
  })

  // AC-155: createAccessRequest rejects when subscriptionsBlocked
  it('createAccessRequest returns null when merchant has subscriptionsBlocked', () => {
    blockMerchantSubscriptions('user-merchant-1', true)
    const result = createAccessRequest({
      consumerId: 'user-consumer-2',
      consumerName: 'Dave Developer',
      serviceId: 'svc-1', // svc-1 belongs to user-merchant-1
      serviceName: 'Weather API',
    })
    expect(result).toBeNull()
  })
})
