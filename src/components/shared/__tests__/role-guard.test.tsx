import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RoleGuard } from '../role-guard.tsx'
import { useAuthStore } from '@/stores/auth-store.ts'
import type { User } from '@/types/user.ts'

const consumerUser: User = {
  id: 'user-1',
  email: 'consumer@test.com',
  name: 'Consumer User',
  roles: ['consumer'],
  activeRole: 'consumer',
  status: 'active',
  createdAt: '2025-01-01T00:00:00Z',
}

const adminUser: User = {
  id: 'user-2',
  email: 'admin@test.com',
  name: 'Admin User',
  roles: ['admin'],
  activeRole: 'admin',
  status: 'active',
  createdAt: '2025-01-01T00:00:00Z',
}

// AC-007: RoleGuard prevents unauthorized content rendering
describe('RoleGuard', () => {
  beforeEach(() => {
    useAuthStore.setState({ currentUser: null })
  })

  it('renders children when user has allowed role', () => {
    useAuthStore.setState({ currentUser: adminUser })
    render(
      <RoleGuard allowedRoles={['admin']}>
        <p>Admin content</p>
      </RoleGuard>,
    )
    expect(screen.getByText('Admin content')).toBeInTheDocument()
  })

  it('does not render children when user lacks allowed role', () => {
    useAuthStore.setState({ currentUser: consumerUser })
    render(
      <RoleGuard allowedRoles={['admin']}>
        <p>Admin content</p>
      </RoleGuard>,
    )
    expect(screen.queryByText('Admin content')).not.toBeInTheDocument()
  })

  it('renders fallback when user lacks role', () => {
    useAuthStore.setState({ currentUser: consumerUser })
    render(
      <RoleGuard allowedRoles={['admin']} fallback={<p>Access denied</p>}>
        <p>Admin content</p>
      </RoleGuard>,
    )
    expect(screen.queryByText('Admin content')).not.toBeInTheDocument()
    expect(screen.getByText('Access denied')).toBeInTheDocument()
  })

  it('renders nothing when user is not logged in', () => {
    render(
      <RoleGuard allowedRoles={['consumer']}>
        <p>Protected content</p>
      </RoleGuard>,
    )
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
  })
})
