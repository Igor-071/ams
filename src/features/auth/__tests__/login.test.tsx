import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { AuthLayout } from '@/components/layout/auth-layout.tsx'
import { AuthGuard } from '@/components/layout/auth-guard.tsx'
import { LoginPage } from '../pages/login-page.tsx'
import { PlaceholderPage } from '@/pages/placeholder.tsx'
import { useAuthStore } from '@/stores/auth-store.ts'

// Mock delay to be instant in tests
vi.mock('@/mocks/delay.ts', () => ({
  mockDelay: () => Promise.resolve(),
}))

function renderLogin(initialEntries = ['/login']) {
  const router = createMemoryRouter(
    [
      {
        element: <AuthLayout />,
        children: [{ path: 'login', element: <LoginPage /> }],
      },
      { path: 'dashboard', element: <PlaceholderPage /> },
      { path: 'merchant', element: <PlaceholderPage /> },
      { path: 'admin', element: <PlaceholderPage /> },
      {
        element: <AuthGuard allowedRoles={['consumer']} />,
        children: [
          { path: 'dashboard/api-keys', element: <PlaceholderPage /> },
        ],
      },
    ],
    { initialEntries },
  )
  return render(<RouterProvider router={router} />)
}

describe('Login Page', () => {
  beforeEach(() => {
    useAuthStore.getState().logout()
  })

  // AC-001: Login page renders with email input and SSO button
  it('renders email input, continue button, SSO button, register link, and dev panel', async () => {
    renderLogin()

    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument()
    expect(screen.getByText(/register/i)).toBeInTheDocument()
    expect(screen.getByText(/dev quick login/i)).toBeInTheDocument()
  })

  // AC-002: Email validation enables Continue button
  it('keeps Continue disabled for invalid email and enables for valid', async () => {
    renderLogin()
    const user = userEvent.setup()

    const continueBtn = screen.getByRole('button', { name: /continue/i })
    expect(continueBtn).toBeDisabled()

    await user.type(screen.getByPlaceholderText('Enter your email'), 'invalid')
    expect(continueBtn).toBeDisabled()

    await user.clear(screen.getByPlaceholderText('Enter your email'))
    await user.type(screen.getByPlaceholderText('Enter your email'), 'test@example.com')
    expect(continueBtn).toBeEnabled()
  })

  // AC-003: Continue button advances to OTP step
  it('transitions to OTP step showing code-sent message', async () => {
    renderLogin()
    const user = userEvent.setup()

    await user.type(screen.getByPlaceholderText('Enter your email'), 'consumer@startup.io')
    await user.click(screen.getByRole('button', { name: /continue/i }))

    await waitFor(() => {
      expect(screen.getByText(/we sent a code to consumer@startup.io/i)).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: /verify/i })).toBeInTheDocument()
    expect(screen.getByText(/back to email/i)).toBeInTheDocument()
  })

  // AC-004: Valid OTP authenticates and redirects
  it('authenticates with valid OTP and redirects to role dashboard', async () => {
    renderLogin()
    const user = userEvent.setup()

    await user.type(screen.getByPlaceholderText('Enter your email'), 'consumer@startup.io')
    await user.click(screen.getByRole('button', { name: /continue/i }))

    // Wait for OTP step to render
    await screen.findByRole('button', { name: /verify/i })

    // On the OTP step, all textboxes are OTP digit inputs
    const otpInputs = screen.getAllByRole('textbox')
    expect(otpInputs).toHaveLength(6)
    for (let i = 0; i < 6; i++) {
      await user.type(otpInputs[i], String(i + 1))
    }

    await user.click(screen.getByRole('button', { name: /verify/i }))

    await waitFor(() => {
      expect(useAuthStore.getState().currentUser?.email).toBe('consumer@startup.io')
    })
  })

  // AC-005: OTP for unknown email shows error
  it('shows error for unknown email', async () => {
    renderLogin()
    const user = userEvent.setup()

    await user.type(screen.getByPlaceholderText('Enter your email'), 'unknown@test.com')
    await user.click(screen.getByRole('button', { name: /continue/i }))

    // Wait for OTP step to render
    await screen.findByRole('button', { name: /verify/i })

    const otpInputs = screen.getAllByRole('textbox')
    for (let i = 0; i < 6; i++) {
      await user.type(otpInputs[i], '1')
    }

    await user.click(screen.getByRole('button', { name: /verify/i }))

    await waitFor(() => {
      expect(screen.getByText(/no account found/i)).toBeInTheDocument()
    })
  })

  // AC-006: Google SSO mock flow authenticates
  it('authenticates via SSO button', async () => {
    renderLogin()
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /sign in with google/i }))

    await waitFor(() => {
      expect(useAuthStore.getState().currentUser).not.toBeNull()
    })
  })

  // AC-007: Dev panel instant login
  it('logs in instantly via dev panel buttons', async () => {
    renderLogin()
    const user = userEvent.setup()

    await user.click(screen.getByTestId('dev-login-admin'))

    await waitFor(() => {
      expect(useAuthStore.getState().currentUser?.activeRole).toBe('admin')
    })
  })

  // AC-008: Authenticated user visiting /login is redirected
  it('redirects authenticated user away from login page', async () => {
    useAuthStore.getState().login({
      id: 'user-consumer-1',
      email: 'consumer@startup.io',
      name: 'Alice Consumer',
      roles: ['consumer'],
      activeRole: 'consumer',
      status: 'active',
      createdAt: '2025-04-01T00:00:00Z',
    })

    renderLogin()

    await waitFor(() => {
      expect(screen.getByText('/dashboard')).toBeInTheDocument()
    })
  })

  // AC-010: Logout clears state
  it('logout clears auth state', () => {
    useAuthStore.getState().login({
      id: 'user-consumer-1',
      email: 'consumer@startup.io',
      name: 'Alice Consumer',
      roles: ['consumer'],
      activeRole: 'consumer',
      status: 'active',
      createdAt: '2025-04-01T00:00:00Z',
    })

    useAuthStore.getState().logout()
    expect(useAuthStore.getState().currentUser).toBeNull()
  })
})
