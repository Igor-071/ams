import { describe, it, expect, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithRouter, createMockUser, resetStores } from '@/test/test-utils.tsx'
import { RootLayout } from '../root-layout.tsx'
import { PublicLayout } from '../public-layout.tsx'
import { AuthLayout } from '../auth-layout.tsx'
import { DashboardLayout } from '../dashboard-layout.tsx'
import { AuthGuard } from '../auth-guard.tsx'
import { NotFoundPage } from '@/pages/not-found.tsx'
import { HomeRedirect } from '@/pages/home-redirect.tsx'

describe('Routing & Layouts', () => {
  beforeEach(() => {
    resetStores()
  })

  // AC-001: Public routes use PublicLayout
  it('renders PublicLayout for /marketplace', async () => {
    renderWithRouter(
      [
        {
          element: <RootLayout />,
          children: [
            {
              element: <PublicLayout />,
              children: [
                { path: 'marketplace', element: <p>Marketplace content</p> },
              ],
            },
          ],
        },
      ],
      { initialRoute: '/marketplace' },
    )
    await waitFor(() => {
      expect(screen.getByText('Sign In')).toBeInTheDocument()
      expect(screen.getByText('Marketplace content')).toBeInTheDocument()
    })
  })

  // AC-002: Auth routes use AuthLayout
  it('renders AuthLayout for /login', async () => {
    renderWithRouter(
      [
        {
          element: <RootLayout />,
          children: [
            {
              element: <AuthLayout />,
              children: [
                { path: 'login', element: <p>Login form</p> },
              ],
            },
          ],
        },
      ],
      { initialRoute: '/login' },
    )
    await waitFor(() => {
      expect(screen.getByText('AMS')).toBeInTheDocument()
      expect(screen.getByText('Login form')).toBeInTheDocument()
    })
  })

  // AC-003: Dashboard routes use DashboardLayout for consumer
  it('renders DashboardLayout for /dashboard when authenticated as consumer', async () => {
    const user = createMockUser({ activeRole: 'consumer' })
    renderWithRouter(
      [
        {
          element: <RootLayout />,
          children: [
            {
              element: <AuthGuard allowedRoles={['consumer']} />,
              children: [
                {
                  element: <DashboardLayout />,
                  children: [
                    { path: 'dashboard', element: <p>Consumer dashboard</p> },
                  ],
                },
              ],
            },
          ],
        },
      ],
      { initialRoute: '/dashboard', user },
    )
    await waitFor(() => {
      expect(screen.getByText('Consumer dashboard')).toBeInTheDocument()
    })
  })

  // AC-004: Sidebar shows consumer navigation
  it('shows consumer nav items in sidebar', async () => {
    const user = createMockUser({ activeRole: 'consumer' })
    renderWithRouter(
      [
        {
          element: <RootLayout />,
          children: [
            {
              element: <AuthGuard allowedRoles={['consumer']} />,
              children: [
                {
                  element: <DashboardLayout />,
                  children: [
                    { path: 'dashboard', element: <p>Dashboard</p> },
                  ],
                },
              ],
            },
          ],
        },
      ],
      { initialRoute: '/dashboard', user },
    )
    await waitFor(() => {
      expect(screen.getByText('API Keys')).toBeInTheDocument()
      expect(screen.getByText('Usage')).toBeInTheDocument()
      expect(screen.getByText('Services')).toBeInTheDocument()
      expect(screen.getByText('Projects')).toBeInTheDocument()
    })
  })

  // AC-004: Sidebar shows merchant navigation
  it('shows merchant nav items in sidebar', async () => {
    const user = createMockUser({
      roles: ['merchant'],
      activeRole: 'merchant',
    })
    renderWithRouter(
      [
        {
          element: <RootLayout />,
          children: [
            {
              element: <AuthGuard allowedRoles={['merchant']} />,
              children: [
                {
                  element: <DashboardLayout />,
                  children: [
                    { path: 'merchant', element: <p>Dashboard</p> },
                  ],
                },
              ],
            },
          ],
        },
      ],
      { initialRoute: '/merchant', user },
    )
    await waitFor(() => {
      expect(screen.getByText('Consumers')).toBeInTheDocument()
      expect(screen.getByText('Invoices')).toBeInTheDocument()
    })
  })

  // AC-004: Sidebar shows admin navigation
  it('shows admin nav items in sidebar', async () => {
    const user = createMockUser({
      roles: ['admin'],
      activeRole: 'admin',
    })
    renderWithRouter(
      [
        {
          element: <RootLayout />,
          children: [
            {
              element: <AuthGuard allowedRoles={['admin']} />,
              children: [
                {
                  element: <DashboardLayout />,
                  children: [
                    { path: 'admin', element: <p>Dashboard</p> },
                  ],
                },
              ],
            },
          ],
        },
      ],
      { initialRoute: '/admin', user },
    )
    await waitFor(() => {
      expect(screen.getByText('Merchants')).toBeInTheDocument()
      expect(screen.getByText('Governance')).toBeInTheDocument()
    })
  })

  // AC-007 via AuthGuard: Redirects unauthorized users
  it('redirects unauthenticated users to /login', async () => {
    renderWithRouter(
      [
        {
          element: <RootLayout />,
          children: [
            {
              element: <AuthGuard allowedRoles={['consumer']} />,
              children: [
                {
                  element: <DashboardLayout />,
                  children: [
                    { path: 'dashboard', element: <p>Dashboard</p> },
                  ],
                },
              ],
            },
            { path: 'login', element: <p>Login page</p> },
          ],
        },
      ],
      { initialRoute: '/dashboard' },
    )
    await waitFor(() => {
      expect(screen.getByText('Login page')).toBeInTheDocument()
    })
  })

  // AC-010: 404 page for unknown routes
  it('shows 404 page for unknown routes', async () => {
    renderWithRouter(
      [
        {
          element: <RootLayout />,
          children: [
            { path: '*', element: <NotFoundPage /> },
          ],
        },
      ],
      { initialRoute: '/nonexistent' },
    )
    await waitFor(() => {
      expect(screen.getByText('404')).toBeInTheDocument()
      expect(screen.getByText('Page not found')).toBeInTheDocument()
      expect(screen.getByText('Go to Marketplace')).toBeInTheDocument()
    })
  })

  // AC-011: Root redirect for unauthenticated → /marketplace
  it('redirects unauthenticated users to /marketplace from /', async () => {
    renderWithRouter(
      [
        {
          element: <RootLayout />,
          children: [
            { index: true, element: <HomeRedirect /> },
            {
              element: <PublicLayout />,
              children: [
                { path: 'marketplace', element: <p>Public marketplace</p> },
              ],
            },
          ],
        },
      ],
      { initialRoute: '/' },
    )
    await waitFor(() => {
      expect(screen.getByText('Public marketplace')).toBeInTheDocument()
    })
  })

  // AC-011: Root redirect for consumer → /dashboard
  it('redirects consumer to /dashboard from /', async () => {
    const user = createMockUser({ activeRole: 'consumer' })
    renderWithRouter(
      [
        {
          element: <RootLayout />,
          children: [
            { index: true, element: <HomeRedirect /> },
            {
              element: <AuthGuard allowedRoles={['consumer']} />,
              children: [
                {
                  element: <DashboardLayout />,
                  children: [
                    { path: 'dashboard', element: <p>Consumer home</p> },
                  ],
                },
              ],
            },
          ],
        },
      ],
      { initialRoute: '/', user },
    )
    await waitFor(() => {
      expect(screen.getByText('Consumer home')).toBeInTheDocument()
    })
  })

  // AC-011: Root redirect for admin → /admin
  it('redirects admin to /admin from /', async () => {
    const user = createMockUser({
      roles: ['admin'],
      activeRole: 'admin',
    })
    renderWithRouter(
      [
        {
          element: <RootLayout />,
          children: [
            { index: true, element: <HomeRedirect /> },
            {
              element: <AuthGuard allowedRoles={['admin']} />,
              children: [
                {
                  element: <DashboardLayout />,
                  children: [
                    { path: 'admin', element: <p>Admin home</p> },
                  ],
                },
              ],
            },
          ],
        },
      ],
      { initialRoute: '/', user },
    )
    await waitFor(() => {
      expect(screen.getByText('Admin home')).toBeInTheDocument()
    })
  })
})
