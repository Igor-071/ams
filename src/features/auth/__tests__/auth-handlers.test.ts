import { describe, it, expect } from 'vitest'
import {
  getUserByEmail,
  createConsumerUser,
  validateInviteCode,
  createMerchantUser,
} from '@/mocks/handlers.ts'

describe('Auth Mock Handlers', () => {
  it('getUserByEmail finds existing user', () => {
    const user = getUserByEmail('consumer@startup.io')
    expect(user).toBeDefined()
    expect(user?.name).toBe('Alice Consumer')
  })

  it('getUserByEmail returns undefined for unknown email', () => {
    expect(getUserByEmail('nonexistent@test.com')).toBeUndefined()
  })

  it('getUserByEmail is case-insensitive', () => {
    const user = getUserByEmail('CONSUMER@STARTUP.IO')
    expect(user).toBeDefined()
  })

  it('createConsumerUser creates a new user with consumer role', () => {
    const user = createConsumerUser({
      name: 'Test User',
      email: 'test-handler@test.com',
    })
    expect(user.roles).toEqual(['consumer'])
    expect(user.activeRole).toBe('consumer')
    expect(user.status).toBe('active')
    expect(user.name).toBe('Test User')

    // Verify it can be found
    const found = getUserByEmail('test-handler@test.com')
    expect(found?.id).toBe(user.id)
  })

  it('validateInviteCode returns true for valid codes', () => {
    expect(validateInviteCode('INV-NEW-2025')).toBe(true)
  })

  it('validateInviteCode returns false for invalid codes', () => {
    expect(validateInviteCode('INVALID')).toBe(false)
    expect(validateInviteCode('')).toBe(false)
  })

  it('createMerchantUser creates user with merchant role and profile', () => {
    const user = createMerchantUser({
      name: 'New Merchant',
      email: 'handler-merchant@test.com',
      inviteCode: 'INV-DEMO-2025',
      companyName: 'Test Corp',
    })
    expect(user.roles).toEqual(['merchant'])
    expect(user.activeRole).toBe('merchant')

    // Invite code should now be consumed
    expect(validateInviteCode('INV-DEMO-2025')).toBe(false)
  })
})
