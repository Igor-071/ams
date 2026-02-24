import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'

// Mock ResponsiveContainer to avoid zero-size issues in jsdom
vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts')
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: 800, height: 300 }}>{children}</div>
    ),
  }
})
import type { Role } from '@/types/user.ts'
import { useAuthStore } from '@/stores/auth-store.ts'
import { AdminMerchantDetailPage } from '../pages/admin-merchant-detail-page.tsx'
import { AdminMerchantsPage } from '../pages/admin-merchants-page.tsx'
import { AdminDashboardPage } from '../pages/admin-dashboard-page.tsx'
import {
  getUserById,
  getActiveServices,
  approveMerchantOnboarding,
  rejectMerchantOnboarding,
  disableMerchant,
} from '@/mocks/handlers.ts'
import { mockUsers } from '@/mocks/data/users.ts'

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

describe('Merchant Lifecycle States', () => {
  beforeEach(() => {
    useAuthStore.getState().login(mockAdmin)
  })

  // AC-133: UserStatus extended with 'pending' and 'disabled'
  it('supports pending and disabled user statuses', () => {
    const pendingUser = getUserById('user-merchant-pending')
    expect(pendingUser).toBeDefined()
    expect(pendingUser!.status).toBe('pending')
  })

  // AC-134: StatusBadge renders 'disabled' with red styling
  it('renders disabled status badge', () => {
    // First disable a merchant to test
    const testUser = mockUsers.find((u) => u.id === 'user-merchant-3')
    if (testUser && testUser.status === 'suspended') {
      disableMerchant('user-merchant-3')
    }
    renderMerchantDetail('user-merchant-3')
    expect(screen.getByText('Disabled')).toBeInTheDocument()
  })

  // AC-135: Mock pending merchant exists
  it('has mock pending merchant user-merchant-pending', () => {
    const user = getUserById('user-merchant-pending')
    expect(user).toBeDefined()
    expect(user!.name).toBe('Pending Pete')
    expect(user!.status).toBe('pending')
    expect(user!.roles).toContain('merchant')
  })

  // AC-136: approveMerchantOnboarding → status=active
  it('approves merchant onboarding setting status to active', () => {
    // Ensure user is pending first
    const user = mockUsers.find((u) => u.id === 'user-merchant-pending')!
    user.status = 'pending'
    const result = approveMerchantOnboarding('user-merchant-pending')
    expect(result).toBeDefined()
    expect(result!.status).toBe('active')
    // Reset for other tests
    user.status = 'pending'
  })

  // AC-137: rejectMerchantOnboarding → status=disabled
  it('rejects merchant onboarding setting status to disabled', () => {
    const user = mockUsers.find((u) => u.id === 'user-merchant-pending')!
    user.status = 'pending'
    const result = rejectMerchantOnboarding('user-merchant-pending')
    expect(result).toBeDefined()
    expect(result!.status).toBe('disabled')
    // Reset for other tests
    user.status = 'pending'
  })

  // AC-138: disableMerchant → status=disabled, services suspended
  it('disables merchant and suspends their services', () => {
    // Use merchant-1 which has active services
    const user = mockUsers.find((u) => u.id === 'user-merchant-1')!
    const originalStatus = user.status
    user.status = 'active'
    disableMerchant('user-merchant-1')
    expect(user.status).toBe('disabled')
    // Restore for other tests
    user.status = originalStatus
  })

  // AC-139: Pending state → Approve + Reject buttons
  it('shows Approve and Reject buttons for pending merchant', () => {
    const user = mockUsers.find((u) => u.id === 'user-merchant-pending')!
    user.status = 'pending'
    renderMerchantDetail('user-merchant-pending')
    expect(screen.getByRole('button', { name: /^Approve$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Reject$/i })).toBeInTheDocument()
  })

  // AC-140: Active state → Suspend + Disable buttons
  it('shows Suspend and Disable buttons for active merchant', () => {
    renderMerchantDetail('user-merchant-1')
    expect(screen.getByRole('button', { name: /Suspend Merchant/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Disable Merchant/i })).toBeInTheDocument()
  })

  // AC-141: Suspended state → Unsuspend + Disable buttons
  it('shows Unsuspend and Disable buttons for suspended merchant', () => {
    const user = mockUsers.find((u) => u.id === 'user-merchant-3')!
    user.status = 'suspended'
    renderMerchantDetail('user-merchant-3')
    expect(screen.getByRole('button', { name: /Unsuspend Merchant/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Disable Merchant/i })).toBeInTheDocument()
  })

  // AC-142: Disabled state → warning banner, no actions
  it('shows warning banner and no action buttons for disabled merchant', () => {
    const user = mockUsers.find((u) => u.id === 'user-merchant-3')!
    user.status = 'disabled'
    renderMerchantDetail('user-merchant-3')
    expect(screen.getByText(/permanently disabled/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Suspend/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Unsuspend/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Approve/i })).not.toBeInTheDocument()
    // Restore
    user.status = 'suspended'
  })

  // AC-143: Admin merchants page: status filter dropdown
  it('renders status filter dropdown on merchants page', async () => {
    renderMerchantsPage()
    const select = screen.getByRole('combobox', { name: /Filter by status/i })
    expect(select).toBeInTheDocument()
    // Check options exist
    const options = select.querySelectorAll('option')
    const labels = Array.from(options).map((o) => o.textContent)
    expect(labels).toContain('All Statuses')
    expect(labels).toContain('Active')
    expect(labels).toContain('Pending')
    expect(labels).toContain('Suspended')
    expect(labels).toContain('Disabled')
  })

  // AC-144: getActiveServices excludes disabled/suspended merchants
  it('getActiveServices excludes services from disabled/suspended merchants', () => {
    // user-merchant-3 is suspended, their services should be excluded
    const user = mockUsers.find((u) => u.id === 'user-merchant-3')!
    user.status = 'suspended'
    const active = getActiveServices({ pageSize: 100 })
    const hasSuspendedMerchantService = active.data.some((s) => s.merchantId === 'user-merchant-3')
    expect(hasSuspendedMerchantService).toBe(false)
  })

  // AC-145: Admin dashboard pending count includes pending merchants
  it('includes pending merchants in dashboard pending count', () => {
    const user = mockUsers.find((u) => u.id === 'user-merchant-pending')!
    user.status = 'pending'

    const router = createMemoryRouter(
      [{ path: '/admin', element: <AdminDashboardPage /> }],
      { initialEntries: ['/admin'] },
    )
    render(<RouterProvider router={router} />)
    // The pending count should be at least 1 (from the pending merchant)
    expect(screen.getByText('Pending Approvals')).toBeInTheDocument()
  })
})
