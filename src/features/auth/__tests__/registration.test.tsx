import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { AuthLayout } from '@/components/layout/auth-layout.tsx'
import { RegisterPage } from '../pages/register-page.tsx'
import { MerchantRegisterPage } from '../pages/merchant-register-page.tsx'
import { PlaceholderPage } from '@/pages/placeholder.tsx'
import { useAuthStore } from '@/stores/auth-store.ts'

vi.mock('@/mocks/delay.ts', () => ({
  mockDelay: () => Promise.resolve(),
}))

function renderRegister(path = '/register') {
  const router = createMemoryRouter(
    [
      {
        element: <AuthLayout />,
        children: [
          { path: 'register', element: <RegisterPage /> },
          { path: 'register/merchant', element: <MerchantRegisterPage /> },
        ],
      },
      { path: 'dashboard', element: <PlaceholderPage /> },
      { path: 'merchant', element: <PlaceholderPage /> },
      { path: 'login', element: <div>Login Page</div> },
    ],
    { initialEntries: [path] },
  )
  return render(<RouterProvider router={router} />)
}

describe('Consumer Registration', () => {
  beforeEach(() => {
    useAuthStore.getState().logout()
  })

  // AC-011: Consumer registration page renders
  it('renders registration form with name, email, organization, and CTA', () => {
    renderRegister()

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/organization/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
    expect(screen.getByText(/sign in/i)).toBeInTheDocument()
    expect(screen.getByText(/register as merchant/i)).toBeInTheDocument()
  })

  // AC-012: Validates required fields
  it('keeps Create Account disabled when required fields are empty', () => {
    renderRegister()
    expect(screen.getByRole('button', { name: /create account/i })).toBeDisabled()
  })

  // AC-013: Successful registration creates user and logs in
  it('creates consumer user and redirects to dashboard', async () => {
    renderRegister()
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/full name/i), 'New User')
    await user.type(screen.getByLabelText(/email/i), 'newuser@test.com')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      const authUser = useAuthStore.getState().currentUser
      expect(authUser).not.toBeNull()
      expect(authUser?.email).toBe('newuser@test.com')
      expect(authUser?.activeRole).toBe('consumer')
    })
  })

  // AC-014: Existing email shows error
  it('shows error for duplicate email', async () => {
    renderRegister()
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/full name/i), 'Duplicate')
    await user.type(screen.getByLabelText(/email/i), 'consumer@startup.io')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByText(/already exists/i)).toBeInTheDocument()
    })
    expect(useAuthStore.getState().currentUser).toBeNull()
  })

  // AC-019: Authenticated user redirected away
  it('redirects authenticated user away from register', async () => {
    useAuthStore.getState().login({
      id: 'user-consumer-1',
      email: 'consumer@startup.io',
      name: 'Alice Consumer',
      roles: ['consumer'],
      activeRole: 'consumer',
      status: 'active',
      createdAt: '2025-04-01T00:00:00Z',
    })

    renderRegister()

    await waitFor(() => {
      expect(screen.getByText('/dashboard')).toBeInTheDocument()
    })
  })
})

describe('Merchant Registration', () => {
  beforeEach(() => {
    useAuthStore.getState().logout()
  })

  // AC-015: Merchant registration page renders
  it('renders merchant registration form with invite code and company fields', () => {
    renderRegister('/register/merchant')

    expect(screen.getByLabelText(/invite code/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/company name/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /register as merchant/i })).toBeInTheDocument()
  })

  // AC-016: Invalid invite code shows error
  it('shows error for invalid invite code', async () => {
    renderRegister('/register/merchant')
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/invite code/i), 'INVALID-CODE')
    await user.type(screen.getByLabelText(/full name/i), 'Test Merchant')
    await user.type(screen.getByLabelText(/email/i), 'merchant@new.com')
    await user.type(screen.getByLabelText(/company name/i), 'Test Co')
    await user.click(screen.getByRole('button', { name: /register as merchant/i }))

    await waitFor(() => {
      expect(screen.getByText(/invalid or expired invite code/i)).toBeInTheDocument()
    })
  })

  // AC-017: Valid invite code registers merchant
  it('creates merchant user with valid invite code', async () => {
    renderRegister('/register/merchant')
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/invite code/i), 'INV-TEST-2025')
    await user.type(screen.getByLabelText(/full name/i), 'Test Merchant')
    await user.type(screen.getByLabelText(/email/i), 'merchantnew@new.com')
    await user.type(screen.getByLabelText(/company name/i), 'Test Co')
    await user.click(screen.getByRole('button', { name: /register as merchant/i }))

    await waitFor(() => {
      const authUser = useAuthStore.getState().currentUser
      expect(authUser).not.toBeNull()
      expect(authUser?.activeRole).toBe('merchant')
    })
  })

  // AC-018: Invite code from URL pre-filled
  it('pre-fills invite code from URL query parameter', () => {
    renderRegister('/register/merchant?code=INV-NEW-2025')

    const inviteInput = screen.getByLabelText(/invite code/i) as HTMLInputElement
    expect(inviteInput.value).toBe('INV-NEW-2025')
    expect(inviteInput).toHaveAttribute('readonly')
  })
})
