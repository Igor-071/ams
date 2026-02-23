import { describe, it, expect } from 'vitest'
import {
  getActiveServices,
  getServiceById,
  getAccessRequestForService,
  createAccessRequest,
} from '@/mocks/handlers.ts'

describe('Marketplace Mock Handlers', () => {
  it('getActiveServices returns only active public services', () => {
    const result = getActiveServices()
    expect(result.data.length).toBeGreaterThan(0)
    expect(result.data.every((s) => s.status === 'active')).toBe(true)
    // svc-4 is active but private, should be excluded
    expect(result.data.every((s) => s.visibility !== 'private')).toBe(true)
    expect(result.data.find((s) => s.id === 'svc-4')).toBeUndefined()
  })

  it('getActiveServices filters by type', () => {
    const result = getActiveServices({ type: 'docker' })
    expect(result.data.length).toBeGreaterThan(0)
    expect(result.data.every((s) => s.type === 'docker')).toBe(true)
  })

  it('getActiveServices searches by name', () => {
    const result = getActiveServices({ search: 'weather' })
    expect(result.data.length).toBe(1)
    expect(result.data[0].name).toBe('Weather API')
  })

  it('getServiceById returns service by id', () => {
    const service = getServiceById('svc-1')
    expect(service).toBeDefined()
    expect(service?.name).toBe('Weather API')
  })

  it('getServiceById returns undefined for unknown id', () => {
    expect(getServiceById('nonexistent')).toBeUndefined()
  })

  it('getAccessRequestForService finds existing request', () => {
    const request = getAccessRequestForService('user-consumer-1', 'svc-1')
    expect(request).toBeDefined()
    expect(request?.status).toBe('approved')
  })

  it('getAccessRequestForService returns undefined for no request', () => {
    expect(
      getAccessRequestForService('user-consumer-1', 'svc-3'),
    ).toBeUndefined()
  })

  it('createAccessRequest creates a pending request', () => {
    const request = createAccessRequest({
      consumerId: 'test-consumer',
      consumerName: 'Test User',
      serviceId: 'svc-test',
      serviceName: 'Test Service',
    })

    expect(request.status).toBe('pending')
    expect(request.consumerId).toBe('test-consumer')
    expect(request.serviceId).toBe('svc-test')
    expect(request.requestedAt).toBeDefined()

    // Verify it can be found
    const found = getAccessRequestForService('test-consumer', 'svc-test')
    expect(found?.id).toBe(request.id)
  })
})
