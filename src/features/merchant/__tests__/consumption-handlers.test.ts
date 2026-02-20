import { describe, it, expect } from 'vitest'
import { simulateConsumption, getConsumerApprovedServices, getConsumerServiceUsage } from '@/mocks/handlers.ts'

describe('Consumption Handlers', () => {
  // AC-103: simulateConsumption runs 5-step validation
  it('returns 401 for invalid API key (step 1 fails)', () => {
    const result = simulateConsumption('nonexistent-key', 'svc-1')
    expect(result.success).toBe(false)
    expect(result.statusCode).toBe(401)
    expect(result.validationResults).toHaveLength(1)
    expect(result.validationResults[0].step).toBe('api_key_validation')
    expect(result.validationResults[0].passed).toBe(false)
  })

  it('returns 403 for expired API key (step 2 fails)', () => {
    // key-3 is expired, authorized for svc-1
    const result = simulateConsumption('ams_live_x1y2z3a4b5c6d7e8f9g0h1i2j3k4l5m6', 'svc-1')
    expect(result.success).toBe(false)
    expect(result.statusCode).toBe(403)
    expect(result.validationResults).toHaveLength(2)
    expect(result.validationResults[0].passed).toBe(true)
    expect(result.validationResults[1].step).toBe('ttl_check')
    expect(result.validationResults[1].passed).toBe(false)
  })

  it('returns 403 for key not authorized for service (step 3 fails)', () => {
    // key-1 is active, authorized for svc-1 and svc-2 only
    const result = simulateConsumption('ams_live_k1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6', 'svc-4')
    expect(result.success).toBe(false)
    expect(result.statusCode).toBe(403)
    expect(result.validationResults).toHaveLength(3)
    expect(result.validationResults[2].step).toBe('service_authorization')
    expect(result.validationResults[2].passed).toBe(false)
  })

  it('returns 200 for valid active key with all steps passing', () => {
    // key-1 active, authorized for svc-1, svc-1 has endpoint configured
    const result = simulateConsumption('ams_live_k1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6', 'svc-1')
    expect(result.success).toBe(true)
    expect(result.statusCode).toBe(200)
    expect(result.validationResults).toHaveLength(5)
    expect(result.validationResults.every((r) => r.passed)).toBe(true)
    expect(result.responseTimeMs).toBeGreaterThan(0)
  })

  it('stops at first failing step', () => {
    const result = simulateConsumption('nonexistent', 'svc-1')
    // Only 1 result since it stops at step 1
    expect(result.validationResults).toHaveLength(1)
  })

  // AC-109: Consumer approved services handler
  it('getConsumerApprovedServices returns only approved services', () => {
    const services = getConsumerApprovedServices('user-consumer-1')
    // user-consumer-1 has ar-1 (svc-1, approved) and ar-2 (svc-2, approved), ar-3 (svc-4, pending)
    expect(services.length).toBeGreaterThanOrEqual(2)
    expect(services.some((s) => s.id === 'svc-1')).toBe(true)
    expect(services.some((s) => s.id === 'svc-2')).toBe(true)
    // svc-4 access is pending, should not be included
    expect(services.some((s) => s.id === 'svc-4')).toBe(false)
  })

  // AC-110: Consumer per-service usage handler
  it('getConsumerServiceUsage returns correct stats', () => {
    const usage = getConsumerServiceUsage('user-consumer-1', 'svc-1')
    expect(usage.totalRequests).toBeGreaterThanOrEqual(1)
    expect(usage.avgResponseTimeMs).toBeGreaterThan(0)
    expect(usage.records.length).toBe(usage.totalRequests)
  })
})
