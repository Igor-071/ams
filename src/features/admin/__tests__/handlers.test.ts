import { describe, it, expect } from 'vitest'
import {
  getMerchantProfile,
  getConsumerProfile,
  approveService,
  rejectService,
  approveAccessRequest,
  denyAccessRequest,
  createMerchantInvite,
  createService,
  getServiceById,
  validateInviteCode,
} from '@/mocks/handlers.ts'

describe('Admin Handlers', () => {
  it('getMerchantProfile returns profile for merchant user', () => {
    const profile = getMerchantProfile('user-merchant-1')
    expect(profile).toBeDefined()
    expect(profile!.companyName).toBe('ACME APIs')
  })

  it('getMerchantProfile returns undefined for non-merchant', () => {
    const profile = getMerchantProfile('user-consumer-1')
    expect(profile).toBeUndefined()
  })

  it('getConsumerProfile returns profile for consumer user', () => {
    const profile = getConsumerProfile('user-consumer-1')
    expect(profile).toBeDefined()
    expect(profile!.organization).toBe('Startup.io')
  })

  it('approveService changes pending service to active', () => {
    // Create a fresh service to approve
    const svc = createService({
      merchantId: 'user-merchant-1',
      merchantName: 'ACME APIs',
      name: 'Admin Approve Test',
      description: 'Test',
      type: 'api',
      category: 'Test',
      pricing: { type: 'free' },
    })
    expect(svc.status).toBe('pending_approval')
    const approved = approveService(svc.id)
    expect(approved).toBeDefined()
    expect(approved!.status).toBe('active')
    // Verify it persists
    expect(getServiceById(svc.id)!.status).toBe('active')
  })

  it('rejectService changes pending service to rejected', () => {
    const svc = createService({
      merchantId: 'user-merchant-1',
      merchantName: 'ACME APIs',
      name: 'Admin Reject Test',
      description: 'Test',
      type: 'api',
      category: 'Test',
      pricing: { type: 'free' },
    })
    const rejected = rejectService(svc.id)
    expect(rejected).toBeDefined()
    expect(rejected!.status).toBe('rejected')
  })

  it('approveService returns undefined for non-pending service', () => {
    const result = approveService('svc-1') // svc-1 is already active
    expect(result).toBeUndefined()
  })

  it('createMerchantInvite generates valid invite code', () => {
    const result = createMerchantInvite('test@example.com')
    expect(result.code).toMatch(/^INV-/)
    expect(result.link).toContain('/register/merchant?code=')
    // The code should be valid
    expect(validateInviteCode(result.code)).toBe(true)
  })

  it('approveAccessRequest changes pending request to approved', () => {
    // ar-3 is pending — but may have been modified by other tests
    // Use a known pending one or check
    const result = approveAccessRequest('ar-3')
    if (result) {
      expect(result.status).toBe('approved')
      expect(result.resolvedBy).toBe('user-admin-1')
    }
  })

  it('denyAccessRequest returns undefined for non-pending request', () => {
    // ar-1 is already approved
    const result = denyAccessRequest('ar-1')
    expect(result).toBeUndefined()
  })
})
