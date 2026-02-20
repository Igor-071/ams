import { describe, it, expect } from 'vitest'
import {
  getUsers,
  getUserById,
  getServices,
  getActiveServices,
  getServiceById,
  getServicesByMerchant,
  getAccessRequests,
  getApiKeys,
  getApiKeysByConsumer,
  getApiKeyById,
  getUsageRecords,
  getDailyUsage,
  getInvoices,
  getInvoicesByMerchant,
  getInvoiceById,
  getAuditLogs,
} from '../handlers.ts'

// AC-019: Mock data layer provides seed data through handlers
describe('Mock Handlers', () => {
  describe('Users', () => {
    it('returns paginated users', () => {
      const result = getUsers()
      expect(result.data.length).toBeGreaterThan(0)
      expect(result.total).toBeGreaterThan(0)
      expect(result.page).toBe(1)
    })

    it('filters users by search', () => {
      const result = getUsers({ search: 'Alice' })
      expect(result.data).toHaveLength(1)
      expect(result.data[0].name).toBe('Alice Consumer')
    })

    it('filters users by status', () => {
      const result = getUsers({ status: 'blocked' })
      expect(result.data.every((u) => u.status === 'blocked')).toBe(true)
    })

    it('gets user by id', () => {
      const user = getUserById('user-admin-1')
      expect(user).toBeDefined()
      expect(user?.name).toBe('Sarah Admin')
    })
  })

  describe('Services', () => {
    it('returns paginated services', () => {
      const result = getServices()
      expect(result.data.length).toBeGreaterThan(0)
    })

    it('filters by type', () => {
      const result = getServices({ type: 'docker' })
      expect(result.data.every((s) => s.type === 'docker')).toBe(true)
    })

    it('returns only active services', () => {
      const result = getActiveServices()
      expect(result.data.every((s) => s.status === 'active')).toBe(true)
    })

    it('gets service by id', () => {
      const svc = getServiceById('svc-1')
      expect(svc).toBeDefined()
      expect(svc?.name).toBe('Weather API')
    })

    it('filters services by merchant', () => {
      const result = getServicesByMerchant('user-merchant-1')
      expect(result.data.every((s) => s.merchantId === 'user-merchant-1')).toBe(true)
    })
  })

  describe('Access Requests', () => {
    it('returns access requests', () => {
      const result = getAccessRequests()
      expect(result.data.length).toBeGreaterThan(0)
    })

    it('filters by status', () => {
      const result = getAccessRequests({ status: 'pending' })
      expect(result.data.every((r) => r.status === 'pending')).toBe(true)
    })
  })

  describe('API Keys', () => {
    it('returns paginated keys', () => {
      const result = getApiKeys()
      expect(result.data.length).toBeGreaterThan(0)
    })

    it('filters by consumer', () => {
      const result = getApiKeysByConsumer('user-consumer-1')
      expect(result.data.every((k) => k.consumerId === 'user-consumer-1')).toBe(true)
    })

    it('gets key by id', () => {
      const key = getApiKeyById('key-1')
      expect(key).toBeDefined()
      expect(key?.name).toBe('Production Key')
    })
  })

  describe('Usage', () => {
    it('returns usage records', () => {
      const result = getUsageRecords()
      expect(result.data.length).toBeGreaterThan(0)
    })

    it('filters by consumerId', () => {
      const result = getUsageRecords({ consumerId: 'user-consumer-1' })
      expect(result.data.every((u) => u.consumerId === 'user-consumer-1')).toBe(true)
    })

    it('returns daily usage', () => {
      const daily = getDailyUsage()
      expect(daily.length).toBeGreaterThan(0)
      expect(daily[0]).toHaveProperty('date')
      expect(daily[0]).toHaveProperty('requestCount')
    })
  })

  describe('Invoices', () => {
    it('returns paginated invoices', () => {
      const result = getInvoices()
      expect(result.data.length).toBeGreaterThan(0)
    })

    it('filters by merchant', () => {
      const result = getInvoicesByMerchant('user-merchant-1')
      expect(result.data.every((i) => i.merchantId === 'user-merchant-1')).toBe(true)
    })

    it('gets invoice by id', () => {
      const inv = getInvoiceById('inv-1')
      expect(inv).toBeDefined()
      expect(inv?.merchantName).toBe('ACME APIs')
    })
  })

  describe('Audit Logs', () => {
    it('returns sorted audit logs', () => {
      const result = getAuditLogs()
      expect(result.data.length).toBeGreaterThan(0)
      // Verify sorted by timestamp descending
      for (let i = 1; i < result.data.length; i++) {
        expect(new Date(result.data[i - 1].timestamp).getTime()).toBeGreaterThanOrEqual(
          new Date(result.data[i].timestamp).getTime(),
        )
      }
    })

    it('filters by search', () => {
      const result = getAuditLogs({ search: 'Weather' })
      expect(result.data.length).toBeGreaterThan(0)
      expect(result.data.every((l) => l.description.includes('Weather'))).toBe(true)
    })
  })
})
