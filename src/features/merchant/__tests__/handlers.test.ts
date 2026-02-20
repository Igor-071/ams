import { describe, it, expect } from 'vitest'
import {
  createService,
  createApiKey,
  getServicesByMerchant,
  getApiKeysForService,
  getDockerImagesByMerchant,
  revokeApiKey,
  getUsageByApiKeyForService,
  getInvoicesByMerchant,
  getInvoiceById,
} from '@/mocks/handlers.ts'

describe('Merchant Handlers', () => {
  it('getServicesByMerchant returns only that merchant services', () => {
    const result = getServicesByMerchant('user-merchant-1', { pageSize: 100 })
    expect(result.data.length).toBe(3) // svc-1, svc-2, svc-6
    expect(result.data.every((s) => s.merchantId === 'user-merchant-1')).toBe(true)
  })

  it('createService creates a new pending_approval service', () => {
    const service = createService({
      merchantId: 'user-merchant-1',
      merchantName: 'ACME APIs',
      name: 'Test API',
      description: 'A test service',
      type: 'api',
      category: 'Testing',
      pricing: { type: 'free' },
      rateLimitPerMinute: 30,
      tags: ['test'],
    })
    expect(service.id).toBeTruthy()
    expect(service.status).toBe('pending_approval')
    expect(service.name).toBe('Test API')
    expect(service.type).toBe('api')
  })

  it('getApiKeysForService returns keys assigned to that service', () => {
    const keys = getApiKeysForService('svc-1')
    // svc-1 has key-1, key-2, key-3, key-4
    expect(keys.length).toBe(4)
    expect(keys.every((k) => k.serviceIds.includes('svc-1'))).toBe(true)
  })

  it('getDockerImagesByMerchant returns docker images for merchant', () => {
    const images = getDockerImagesByMerchant('user-merchant-2')
    // merchant-2 has svc-3 (docker) → 2 images
    expect(images.length).toBe(2)
    expect(images.every((img) => img.serviceId === 'svc-3')).toBe(true)
  })

  it('getDockerImagesByMerchant returns empty for API-only merchant', () => {
    const images = getDockerImagesByMerchant('user-merchant-1')
    expect(images.length).toBe(0)
  })

  it('revokeApiKey with by=merchant sets revokedBy correctly', () => {
    // Create a fresh key to revoke
    const key = createApiKey({
      consumerId: 'user-consumer-1',
      name: 'Merchant Revoke Test',
      serviceIds: ['svc-1'],
      ttlDays: 30,
    })
    const revoked = revokeApiKey(key.id, 'merchant')
    expect(revoked).toBeDefined()
    expect(revoked!.status).toBe('revoked')
    expect(revoked!.revokedBy).toBe('merchant')
  })

  it('getUsageByApiKeyForService returns usage per key', () => {
    const result = getUsageByApiKeyForService('svc-1')
    expect(result.length).toBeGreaterThan(0)
    // Each entry has the expected shape
    for (const entry of result) {
      expect(entry).toHaveProperty('apiKeyId')
      expect(entry).toHaveProperty('keyName')
      expect(entry).toHaveProperty('requestCount')
    }
  })

  it('getInvoicesByMerchant returns invoices for merchant', () => {
    const result = getInvoicesByMerchant('user-merchant-1', { pageSize: 100 })
    expect(result.data.length).toBe(2) // inv-1, inv-2
    expect(result.data.every((inv) => inv.merchantId === 'user-merchant-1')).toBe(true)
  })

  it('getInvoiceById returns invoice with line items', () => {
    const invoice = getInvoiceById('inv-1')
    expect(invoice).toBeDefined()
    expect(invoice!.lineItems.length).toBe(2)
    expect(invoice!.commissionRate).toBe(0.1)
    expect(invoice!.total).toBe(6.28)
  })
})
