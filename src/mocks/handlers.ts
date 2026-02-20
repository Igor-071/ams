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
import { mockDockerImages } from './data/docker-images.ts'
import { mockProjects } from './data/projects.ts'
import type { DockerImage } from '@/types/docker.ts'
import type { Project } from '@/types/project.ts'
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

// API Key CRUD
export function createApiKey(data: {
  consumerId: string
  name: string
  description?: string
  serviceIds: string[]
  ttlDays: number
}): ApiKey {
  const now = new Date()
  const expires = new Date(now)
  expires.setDate(expires.getDate() + data.ttlDays)
  const id = `key-${Date.now()}`
  const keyValue = `ams_live_${id.replace('key-', '')}${'x'.repeat(30)}`
  const key: ApiKey = {
    id,
    consumerId: data.consumerId,
    name: data.name,
    description: data.description,
    keyValue,
    keyPrefix: 'ams_live',
    serviceIds: data.serviceIds,
    status: 'active',
    ttlDays: data.ttlDays,
    expiresAt: expires.toISOString(),
    createdAt: now.toISOString(),
  }
  mockApiKeys.push(key)
  return key
}

export function revokeApiKey(keyId: string, by: 'consumer' | 'merchant' = 'consumer'): ApiKey | undefined {
  const key = mockApiKeys.find((k) => k.id === keyId)
  if (!key || key.status !== 'active') return undefined
  key.status = 'revoked'
  key.revokedAt = new Date().toISOString()
  key.revokedBy = by
  return key
}

export function getApiKeysForService(serviceId: string): ApiKey[] {
  return mockApiKeys.filter((k) => k.serviceIds.includes(serviceId))
}

// Docker Images
export function getDockerImagesByService(serviceId: string): DockerImage[] {
  return mockDockerImages.filter((img) => img.serviceId === serviceId)
}

export function getDockerImagesForConsumer(consumerId: string): DockerImage[] {
  const approvedServiceIds = mockAccessRequests
    .filter((r) => r.consumerId === consumerId && r.status === 'approved')
    .map((r) => r.serviceId)
  const dockerServiceIds = mockServices
    .filter((s) => s.type === 'docker' && approvedServiceIds.includes(s.id))
    .map((s) => s.id)
  return mockDockerImages.filter((img) => dockerServiceIds.includes(img.serviceId))
}

// Projects
export function getProjectsByConsumer(consumerId: string): Project[] {
  return mockProjects.filter((p) => p.consumerId === consumerId)
}

export function getProjectById(id: string): Project | undefined {
  return mockProjects.find((p) => p.id === id)
}

export function createProject(data: {
  consumerId: string
  consumerName: string
  consumerEmail: string
  name: string
  description?: string
}): Project {
  const project: Project = {
    id: `proj-${Date.now()}`,
    consumerId: data.consumerId,
    name: data.name,
    description: data.description,
    members: [
      {
        userId: data.consumerId,
        name: data.consumerName,
        email: data.consumerEmail,
        role: 'owner',
        addedAt: new Date().toISOString(),
      },
    ],
    serviceIds: [],
    apiKeyIds: [],
    createdAt: new Date().toISOString(),
  }
  mockProjects.push(project)
  return project
}

// Merchant — Service creation
export function createService(data: {
  merchantId: string
  merchantName: string
  name: string
  description: string
  type: Service['type']
  category: string
  pricing: Service['pricing']
  rateLimitPerMinute?: number
  endpoint?: Service['endpoint']
  tags?: string[]
}): Service {
  const service: Service = {
    id: `svc-${Date.now()}`,
    merchantId: data.merchantId,
    merchantName: data.merchantName,
    name: data.name,
    description: data.description,
    type: data.type,
    status: 'pending_approval',
    category: data.category,
    pricing: data.pricing,
    rateLimitPerMinute: data.rateLimitPerMinute ?? 0,
    endpoint: data.endpoint,
    tags: data.tags ?? [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  mockServices.push(service)
  return service
}

// Merchant — Docker images
export function getDockerImagesByMerchant(merchantId: string): DockerImage[] {
  const merchantServiceIds = mockServices
    .filter((s) => s.merchantId === merchantId && s.type === 'docker')
    .map((s) => s.id)
  return mockDockerImages.filter((img) => merchantServiceIds.includes(img.serviceId))
}

// Merchant — Consumer usage by API key for a service
export function getUsageByApiKeyForService(
  serviceId: string,
): { apiKeyId: string; keyName: string; keyPrefix: string; status: string; requestCount: number }[] {
  const keys = getApiKeysForService(serviceId)
  return keys.map((key) => {
    const usage = mockUsageRecords.filter(
      (u) => u.serviceId === serviceId && u.apiKeyId === key.id,
    )
    return {
      apiKeyId: key.id,
      keyName: key.name,
      keyPrefix: key.keyPrefix,
      status: key.status,
      requestCount: usage.length,
    }
  })
}
