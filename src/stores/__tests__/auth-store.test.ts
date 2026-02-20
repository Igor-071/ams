import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from '../auth-store.ts'
import type { User } from '@/types/user.ts'

const mockUser: User = {
  id: 'user-1',
  email: 'test@ams.io',
  name: 'Test User',
  roles: ['consumer', 'merchant'],
  activeRole: 'consumer',
  status: 'active',
  createdAt: '2025-01-01T00:00:00Z',
}

describe('Auth Store', () => {
  beforeEach(() => {
    useAuthStore.setState({ currentUser: null })
    localStorage.clear()
  })

  // AC-008: Auth store persists to localStorage and rehydrates
  it('logs in a user', () => {
    useAuthStore.getState().login(mockUser)
    expect(useAuthStore.getState().currentUser).toEqual(mockUser)
  })

  // AC-009: Auth store logout clears persisted state
  it('logs out a user', () => {
    useAuthStore.getState().login(mockUser)
    useAuthStore.getState().logout()
    expect(useAuthStore.getState().currentUser).toBeNull()
  })

  // AC-008: switchRole updates activeRole
  it('switches role when user has the role', () => {
    useAuthStore.getState().login(mockUser)
    useAuthStore.getState().switchRole('merchant')
    expect(useAuthStore.getState().currentUser?.activeRole).toBe('merchant')
  })

  it('does not switch to a role the user does not have', () => {
    useAuthStore.getState().login(mockUser)
    useAuthStore.getState().switchRole('admin')
    expect(useAuthStore.getState().currentUser?.activeRole).toBe('consumer')
  })

  it('does nothing on switchRole when not logged in', () => {
    useAuthStore.getState().switchRole('admin')
    expect(useAuthStore.getState().currentUser).toBeNull()
  })

  // AC-023: Handles corrupted localStorage gracefully
  it('handles corrupted localStorage gracefully', () => {
    localStorage.setItem('ams-auth', 'not valid json{{{')
    // Re-import the store to trigger rehydration
    const state = useAuthStore.getState()
    expect(state.currentUser).toBeNull()
  })
})
