import type { FilterParams, PaginatedResponse } from '@/types/common.ts'
import type { User, MerchantProfile } from '@/types/user.ts'
import type { Service, AccessRequest } from '@/types/service.ts'
import type { ApiKey } from '@/types/api-key.ts'
import type { UsageRecord, DailyUsage } from '@/types/usage.ts'
import type { Invoice } from '@/types/invoice.ts'
import type { AuditLog } from '@/types/audit.ts'
import { mockUsers, mockMerchantProfiles } from './data/users.ts'
import { mockServices, mockAccessRequests } from './data/services.ts'
import { mockApiKeys } from './data/api-keys.ts'
import { mockUsageRecords, mockDailyUsage } from './data/usage.ts'
import { mockInvoices } from './data/invoices.ts'
import { mockAuditLogs } from './data/audit-logs.ts'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants.ts'

// Valid unused invite codes for merchant registration
const validInviteCodes = new Set(['INV-NEW-2025', 'INV-TEST-2025', 'INV-DEMO-2025'])

function paginate<T>(
  items: T[],
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
): PaginatedResponse<T> {
  const start = (page - 1) * pageSize
  const data = items.slice(start, start + pageSize)
  return {
    data,
    total: items.length,
    page,
    pageSize,
    totalPages: Math.ceil(items.length / pageSize),
  }
}

function filterBySearch<T>(
  items: T[],
  search: string | undefined,
  fields: (keyof T)[],
): T[] {
  if (!search) return items
  const lower = search.toLowerCase()
  return items.filter((item) =>
    fields.some((field) => {
      const val = item[field]
      return typeof val === 'string' && val.toLowerCase().includes(lower)
    }),
  )
}

// Users
export function getUsers(params?: FilterParams): PaginatedResponse<User> {
  let items = [...mockUsers]
  items = filterBySearch(items, params?.search, ['name', 'email'])
  if (params?.status) items = items.filter((u) => u.status === params.status)
  return paginate(items, params?.page, params?.pageSize)
}

export function getUserById(id: string): User | undefined {
  return mockUsers.find((u) => u.id === id)
}

// Services
export function getServices(params?: FilterParams): PaginatedResponse<Service> {
  let items = [...mockServices]
  items = filterBySearch(items, params?.search, ['name', 'description', 'merchantName'])
  if (params?.status) items = items.filter((s) => s.status === params.status)
  if (params?.type) items = items.filter((s) => s.type === params.type)
  return paginate(items, params?.page, params?.pageSize)
}

export function getActiveServices(params?: FilterParams): PaginatedResponse<Service> {
  const activeServices = mockServices.filter((s) => s.status === 'active')
  let items = [...activeServices]
  items = filterBySearch(items, params?.search, ['name', 'description', 'merchantName'])
  if (params?.type) items = items.filter((s) => s.type === params.type)
  return paginate(items, params?.page, params?.pageSize)
}

export function getServiceById(id: string): Service | undefined {
  return mockServices.find((s) => s.id === id)
}

export function getServicesByMerchant(
  merchantId: string,
  params?: FilterParams,
): PaginatedResponse<Service> {
  let items = mockServices.filter((s) => s.merchantId === merchantId)
  items = filterBySearch(items, params?.search, ['name'])
  if (params?.status) items = items.filter((s) => s.status === params.status)
  return paginate(items, params?.page, params?.pageSize)
}

// Access Requests
export function getAccessRequests(
  params?: FilterParams,
): PaginatedResponse<AccessRequest> {
  let items = [...mockAccessRequests]
  if (params?.status) items = items.filter((r) => r.status === params.status)
  return paginate(items, params?.page, params?.pageSize)
}

export function getAccessRequestsByConsumer(
  consumerId: string,
): AccessRequest[] {
  return mockAccessRequests.filter((r) => r.consumerId === consumerId)
}

export function getAccessRequestForService(
  consumerId: string,
  serviceId: string,
): AccessRequest | undefined {
  return mockAccessRequests.find(
    (r) => r.consumerId === consumerId && r.serviceId === serviceId,
  )
}

export function createAccessRequest(data: {
  consumerId: string
  consumerName: string
  serviceId: string
  serviceName: string
}): AccessRequest {
  const request: AccessRequest = {
    id: `ar-${Date.now()}`,
    consumerId: data.consumerId,
    consumerName: data.consumerName,
    serviceId: data.serviceId,
    serviceName: data.serviceName,
    status: 'pending',
    requestedAt: new Date().toISOString(),
  }
  mockAccessRequests.push(request)
  return request
}

// API Keys
export function getApiKeys(params?: FilterParams): PaginatedResponse<ApiKey> {
  let items = [...mockApiKeys]
  items = filterBySearch(items, params?.search, ['name'])
  if (params?.status) items = items.filter((k) => k.status === params.status)
  return paginate(items, params?.page, params?.pageSize)
}

export function getApiKeysByConsumer(
  consumerId: string,
  params?: FilterParams,
): PaginatedResponse<ApiKey> {
  let items = mockApiKeys.filter((k) => k.consumerId === consumerId)
  items = filterBySearch(items, params?.search, ['name'])
  if (params?.status) items = items.filter((k) => k.status === params.status)
  return paginate(items, params?.page, params?.pageSize)
}

export function getApiKeyById(id: string): ApiKey | undefined {
  return mockApiKeys.find((k) => k.id === id)
}

// Usage
export function getUsageRecords(
  params?: FilterParams & { consumerId?: string; serviceId?: string; apiKeyId?: string },
): PaginatedResponse<UsageRecord> {
  let items = [...mockUsageRecords]
  if (params?.consumerId) items = items.filter((u) => u.consumerId === params.consumerId)
  if (params?.serviceId) items = items.filter((u) => u.serviceId === params.serviceId)
  if (params?.apiKeyId) items = items.filter((u) => u.apiKeyId === params.apiKeyId)
  return paginate(items, params?.page, params?.pageSize)
}

export function getDailyUsage(): DailyUsage[] {
  return [...mockDailyUsage]
}

// Invoices
export function getInvoices(params?: FilterParams): PaginatedResponse<Invoice> {
  let items = [...mockInvoices]
  if (params?.status) items = items.filter((i) => i.status === params.status)
  return paginate(items, params?.page, params?.pageSize)
}

export function getInvoicesByMerchant(
  merchantId: string,
  params?: FilterParams,
): PaginatedResponse<Invoice> {
  let items = mockInvoices.filter((i) => i.merchantId === merchantId)
  if (params?.status) items = items.filter((i) => i.status === params.status)
  return paginate(items, params?.page, params?.pageSize)
}

export function getInvoiceById(id: string): Invoice | undefined {
  return mockInvoices.find((i) => i.id === id)
}

// Audit Logs
export function getAuditLogs(
  params?: FilterParams & { action?: string },
): PaginatedResponse<AuditLog> {
  let items = [...mockAuditLogs]
  items = filterBySearch(items, params?.search, ['description', 'actorName'])
  if (params?.action) items = items.filter((l) => l.action === params.action)
  items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  return paginate(items, params?.page, params?.pageSize)
}

// Auth — User lookup
export function getUserByEmail(email: string): User | undefined {
  return mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase())
}

// Auth — Consumer registration
export function createConsumerUser(data: {
  name: string
  email: string
  organization?: string
}): User {
  const user: User = {
    id: `user-consumer-${Date.now()}`,
    email: data.email,
    name: data.name,
    roles: ['consumer'],
    activeRole: 'consumer',
    status: 'active',
    createdAt: new Date().toISOString(),
  }
  mockUsers.push(user)
  return user
}

// Auth — Invite code validation
export function validateInviteCode(code: string): boolean {
  return validInviteCodes.has(code)
}

// Auth — Merchant registration
export function createMerchantUser(data: {
  name: string
  email: string
  inviteCode: string
  companyName: string
  description?: string
  website?: string
}): User {
  const user: User = {
    id: `user-merchant-${Date.now()}`,
    email: data.email,
    name: data.name,
    roles: ['merchant'],
    activeRole: 'merchant',
    status: 'active',
    createdAt: new Date().toISOString(),
  }
  mockUsers.push(user)

  const profile: MerchantProfile = {
    userId: user.id,
    companyName: data.companyName,
    description: data.description ?? '',
    website: data.website,
    inviteCode: data.inviteCode,
    invitedAt: new Date().toISOString(),
  }
  mockMerchantProfiles.push(profile)

  validInviteCodes.delete(data.inviteCode)
  return user
}
