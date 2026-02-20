import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { DashboardLayout } from '@/components/layout/dashboard-layout.tsx'
import { AuthGuard } from '@/components/layout/auth-guard.tsx'
import { PlaceholderPage } from '@/pages/placeholder.tsx'
import { useAuthStore } from '@/stores/auth-store.ts'
import type { User } from '@/types/user.ts'

vi.mock('@/mocks/delay.ts', () => ({
  mockDelay: () => Promise.resolve(),
}))

const dualUser: User = {
  id: 'user-dual-1',
  email: 'dual@techco.com',
  name: 'Eva Dual-Role',
  roles: ['merchant', 'consumer'],
  activeRole: 'merchant',
  status: 'active',
  createdAt: '2025-03-20T00:00:00Z',
}

const singleRoleUser: User = {
  id: 'user-consumer-1',
  email: 'consumer@startup.io',
  name: 'Alice Consumer',
  roles: ['consumer'],
  activeRole: 'consumer',
  status: 'active',
  createdAt: '2025-04-01T00:00:00Z',
}

function renderDashboard(
  user: User,
  initialPath = user.activeRole === 'consumer' ? '/dashboard' : '/merchant',
) {
  useAuthStore.getState().login(user)

  const router = createMemoryRouter(
    [
      {
        element: <AuthGuard allowedRoles={['consumer']} />,
        children: [
          {
            element: <DashboardLayout />,
            children: [{ path: 'dashboard', element: <PlaceholderPage /> }],
          },
        ],
      },
      {
        element: <AuthGuard allowedRoles={['merchant']} />,
        children: [
          {
            element: <DashboardLayout />,
            children: [
              { path: 'merchant', element: <PlaceholderPage /> },
              { path: 'merchant/services', element: <PlaceholderPage /> },
            ],
          },
        ],
      },
      { path: 'login', element: <div>Login Page</div> },
    ],
    { initialEntries: [initialPath] },
  )
  return render(<RouterProvider router={router} />)
}

describe('User Menu & Role Switching', () => {
  beforeEach(() => {
    useAuthStore.getState().logout()
  })

  // AC-020: User menu displays in sidebar footer
  it('shows user avatar, name, and email in sidebar footer', async () => {
    renderDashboard(singleRoleUser)

    await waitFor(() => {
      expect(screen.getByText('Alice Consumer')).toBeInTheDocument()
      expect(screen.getByText('consumer@startup.io')).toBeInTheDocument()
    })
  })

  // AC-021: User menu dropdown shows profile and role options
  it('opens dropdown with profile info and sign out', async () => {
    renderDashboard(dualUser)
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('Eva Dual-Role')).toBeInTheDocument()
    })

    await user.click(screen.getByLabelText('User menu'))

    await waitFor(() => {
      expect(screen.getByText('Sign out')).toBeInTheDocument()
      expect(screen.getByText(/switch to consumer/i)).toBeInTheDocument()
    })
  })

  // AC-022: Single-role user sees no role switch option
  it('does not show Switch option for single-role user', async () => {
    renderDashboard(singleRoleUser)
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByLabelText('User menu')).toBeInTheDocument()
    })

    await user.click(screen.getByLabelText('User menu'))

    await waitFor(() => {
      expect(screen.getByText('Sign out')).toBeInTheDocument()
    })
    expect(screen.queryByText(/switch to/i)).not.toBeInTheDocument()
  })

  // AC-023: Dual-role user can switch roles
  it('switches role from merchant to consumer', async () => {
    renderDashboard(dualUser)
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByLabelText('User menu')).toBeInTheDocument()
    })

    await user.click(screen.getByLabelText('User menu'))

    await waitFor(() => {
      expect(screen.getByText(/switch to consumer/i)).toBeInTheDocument()
    })

    await user.click(screen.getByText(/switch to consumer/i))

    await waitFor(() => {
      expect(useAuthStore.getState().currentUser?.activeRole).toBe('consumer')
    })
  })

  // AC-024: Role switch updates sidebar navigation
  it('shows Consumer nav items after switching from merchant', async () => {
    renderDashboard(dualUser)
    const user = userEvent.setup()

    // Initially showing Merchant sidebar group label
    await waitFor(() => {
      expect(screen.getByText('Services')).toBeInTheDocument()
    })

    await user.click(screen.getByLabelText('User menu'))
    await waitFor(() => {
      expect(screen.getByText(/switch to consumer/i)).toBeInTheDocument()
    })
    await user.click(screen.getByText(/switch to consumer/i))

    // After switch, consumer-specific nav items should appear
    await waitFor(() => {
      expect(screen.getByText('API Keys')).toBeInTheDocument()
    })
  })

  // AC-026: Wrong role accessing protected route redirects
  it('redirects consumer trying to access merchant route to consumer home', async () => {
    const consumerUser = { ...singleRoleUser }
    useAuthStore.getState().login(consumerUser)

    const router = createMemoryRouter(
      [
        {
          element: <AuthGuard allowedRoles={['merchant']} />,
          children: [
            {
              element: <DashboardLayout />,
              children: [{ path: 'merchant/services', element: <PlaceholderPage /> }],
            },
          ],
        },
        { path: 'dashboard', element: <div>Consumer Dashboard</div> },
        { path: 'login', element: <div>Login Page</div> },
      ],
      { initialEntries: ['/merchant/services'] },
    )
    render(<RouterProvider router={router} />)

    await waitFor(() => {
      expect(screen.getByText('Consumer Dashboard')).toBeInTheDocument()
    })
  })

  // AC-027: Logout from user menu clears state
  it('clears auth state and redirects to login on sign out', async () => {
    renderDashboard(singleRoleUser)
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByLabelText('User menu')).toBeInTheDocument()
    })

    await user.click(screen.getByLabelText('User menu'))
    await waitFor(() => {
      expect(screen.getByText('Sign out')).toBeInTheDocument()
    })
    await user.click(screen.getByText('Sign out'))

    await waitFor(() => {
      expect(useAuthStore.getState().currentUser).toBeNull()
      expect(screen.getByText('Login Page')).toBeInTheDocument()
    })
  })
})

describe('Auth Guard', () => {
  beforeEach(() => {
    useAuthStore.getState().logout()
  })

  // AC-009: Unauthenticated user redirected to login
  it('redirects unauthenticated user to /login', async () => {
    const router = createMemoryRouter(
      [
        {
          element: <AuthGuard allowedRoles={['consumer']} />,
          children: [
            { path: 'dashboard', element: <PlaceholderPage /> },
          ],
        },
        { path: 'login', element: <div>Login Page</div> },
      ],
      { initialEntries: ['/dashboard'] },
    )
    render(<RouterProvider router={router} />)

    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeInTheDocument()
    })
  })
})
