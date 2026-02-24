import type { FilterParams, PaginatedResponse } from '@/types/common.ts'
import type { User, MerchantProfile, ConsumerProfile } from '@/types/user.ts'
import type { Service, ServiceMetrics, AccessRequest, ServiceBlock } from '@/types/service.ts'
import type { ApiKey } from '@/types/api-key.ts'
import type { UsageRecord, DailyUsage } from '@/types/usage.ts'
import type { Invoice } from '@/types/invoice.ts'
import type { AuditLog, AuditAction } from '@/types/audit.ts'
import type { ConsumptionResponse, ValidationResult } from '@/types/consumption.ts'
import { mockUsers, mockMerchantProfiles, mockConsumerProfiles } from './data/users.ts'
import { mockServices, mockAccessRequests, mockServiceBlocks } from './data/services.ts'
import { mockApiKeys } from './data/api-keys.ts'
import { mockUsageRecords, mockDailyUsage, generateUsageRecordsForDate } from './data/usage.ts'
import { mockInvoices } from './data/invoices.ts'
import { mockAuditLogs } from './data/audit-logs.ts'
import { mockDockerImages } from './data/docker-images.ts'
import { mockProjects } from './data/projects.ts'
import { persistCache, CACHE_KEYS } from './data/hmr-cache.ts'
import type { DockerImage } from '@/types/docker.ts'
import type { Project } from '@/types/project.ts'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants.ts'

let idCounter = 0
function uniqueId(prefix: string): string {
  return `${prefix}-${Date.now()}-${idCounter++}`
}

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
  const excludedMerchantIds = new Set(
    mockUsers
      .filter((u) => u.status === 'disabled' || u.status === 'suspended')
      .map((u) => u.id),
  )
  const activeServices = mockServices.filter(
    (s) => s.status === 'active' && s.visibility !== 'private' && !excludedMerchantIds.has(s.merchantId),
  )
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

// Service Metrics (computed from usage records + access requests)
const uptimeMap: Record<string, number> = {
  'svc-1': 99.95,
  'svc-2': 99.9,
  'svc-3': 99.8,
  'svc-4': 99.7,
  'svc-5': 0,
  'svc-6': 0,
  'svc-7': 98.5,
}

export function getServiceMetrics(serviceId: string): ServiceMetrics {
  const records = mockUsageRecords.filter((u) => u.serviceId === serviceId)
  const totalRequests = records.length
  const successCount = records.filter((r) => r.statusCode >= 200 && r.statusCode < 400).length
  const avgResponseTimeMs =
    totalRequests > 0
      ? Math.round(records.reduce((sum, r) => sum + r.responseTimeMs, 0) / totalRequests)
      : 0
  const activeConsumers = new Set(
    mockAccessRequests
      .filter((r) => r.serviceId === serviceId && r.status === 'approved')
      .map((r) => r.consumerId),
  ).size
  const uptimePercent = uptimeMap[serviceId] ?? 99.9
  const successRate = totalRequests > 0 ? successCount / totalRequests : 1

  return { totalRequests, activeConsumers, avgResponseTimeMs, uptimePercent, successRate }
}

export function getServiceConsumerCount(serviceId: string): number {
  return new Set(
    mockAccessRequests
      .filter((r) => r.serviceId === serviceId && r.status === 'approved')
      .map((r) => r.consumerId),
  ).size
}

export function getMerchantServiceCount(merchantId: string): number {
  return mockServices.filter((s) => s.merchantId === merchantId && s.status === 'active').length
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
}): AccessRequest | null {
  // Check if merchant has subscriptions blocked
  const service = mockServices.find((s) => s.id === data.serviceId)
  if (service) {
    const merchantProfile = mockMerchantProfiles.find((p) => p.userId === service.merchantId)
    if (merchantProfile?.subscriptionsBlocked) {
      return null
    }
  }

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
  persistCache(CACHE_KEYS.accessRequests)
  return request
}

export function getAccessRequestsByMerchant(merchantId: string): AccessRequest[] {
  const merchantServiceIds = mockServices
    .filter((s) => s.merchantId === merchantId)
    .map((s) => s.id)
  return mockAccessRequests.filter((r) => merchantServiceIds.includes(r.serviceId))
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

export function getDailyUsageByMerchant(merchantId: string): DailyUsage[] {
  const merchantServiceCount = mockServices.filter((s) => s.merchantId === merchantId).length
  const totalActiveServices = mockServices.filter((s) => s.status === 'active').length || 1
  const baseShare = merchantServiceCount / totalActiveServices

  // Seeded PRNG keyed on merchantId for deterministic ±30% daily variance
  let seed = 0
  for (let i = 0; i < merchantId.length; i++) {
    seed = (seed * 31 + merchantId.charCodeAt(i)) | 0
  }
  seed = Math.abs(seed) || 1

  return mockDailyUsage.map((day) => {
    seed = (seed * 16807 + 0) % 2147483647
    const variance = 0.7 + ((seed - 1) / 2147483646) * 0.6 // 0.7–1.3
    const requestCount = Math.max(1, Math.round(day.requestCount * baseShare * variance))
    const cost = Math.round(requestCount * 0.001 * 100) / 100
    const errorCount = Math.round(day.errorCount * baseShare * variance)
    return { date: day.date, requestCount, cost, errorCount }
  })
}

export function getDailyUsageByConsumer(consumerId: string): DailyUsage[] {
  const approvedServiceIds = mockAccessRequests
    .filter((r) => r.consumerId === consumerId && r.status === 'approved')
    .map((r) => r.serviceId)
  const totalActiveServices = mockServices.filter((s) => s.status === 'active').length || 1
  const baseShare = approvedServiceIds.length / totalActiveServices

  // Seeded PRNG keyed on consumerId for deterministic ±30% daily variance
  let seed = 0
  for (let i = 0; i < consumerId.length; i++) {
    seed = (seed * 31 + consumerId.charCodeAt(i)) | 0
  }
  seed = Math.abs(seed) || 1

  return mockDailyUsage.map((day) => {
    seed = (seed * 16807 + 0) % 2147483647
    const variance = 0.7 + ((seed - 1) / 2147483646) * 0.6 // 0.7–1.3
    const requestCount = Math.max(1, Math.round(day.requestCount * baseShare * variance))
    const cost = Math.round(requestCount * 0.001 * 100) / 100
    const errorCount = Math.round(day.errorCount * baseShare * variance)
    return { date: day.date, requestCount, cost, errorCount }
  })
}

export function getUsageRecordsByDate(
  date: string,
  params?: FilterParams,
): PaginatedResponse<UsageRecord> {
  const records = [...generateUsageRecordsForDate(date)]

  if (params?.sortBy) {
    const dir = params.sortOrder === 'desc' ? -1 : 1
    const key = params.sortBy

    records.sort((a, b) => {
      let aVal: string | number
      let bVal: string | number

      if (key === 'serviceName') {
        aVal = getServiceById(a.serviceId)?.name ?? ''
        bVal = getServiceById(b.serviceId)?.name ?? ''
      } else if (key === 'serviceType') {
        aVal = getServiceById(a.serviceId)?.type ?? ''
        bVal = getServiceById(b.serviceId)?.type ?? ''
      } else if (key === 'merchantName') {
        aVal = getServiceById(a.serviceId)?.merchantName ?? ''
        bVal = getServiceById(b.serviceId)?.merchantName ?? ''
      } else {
        aVal = a[key as keyof UsageRecord] as string | number
        bVal = b[key as keyof UsageRecord] as string | number
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return aVal.localeCompare(bVal) * dir
      }
      return ((aVal as number) - (bVal as number)) * dir
    })
  }

  return paginate(records, params?.page, params?.pageSize ?? 20)
}

export function getUsageRecordsByDateForConsumer(
  date: string,
  consumerId: string,
  params?: FilterParams,
): PaginatedResponse<UsageRecord> {
  let records = generateUsageRecordsForDate(date).filter(
    (r) => r.consumerId === consumerId,
  )

  if (params?.sortBy) {
    const dir = params.sortOrder === 'desc' ? -1 : 1
    const key = params.sortBy

    records = [...records].sort((a, b) => {
      let aVal: string | number
      let bVal: string | number

      if (key === 'serviceName') {
        aVal = getServiceById(a.serviceId)?.name ?? ''
        bVal = getServiceById(b.serviceId)?.name ?? ''
      } else if (key === 'serviceType') {
        aVal = getServiceById(a.serviceId)?.type ?? ''
        bVal = getServiceById(b.serviceId)?.type ?? ''
      } else {
        aVal = a[key as keyof UsageRecord] as string | number
        bVal = b[key as keyof UsageRecord] as string | number
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return aVal.localeCompare(bVal) * dir
      }
      return ((aVal as number) - (bVal as number)) * dir
    })
  }

  return paginate(records, params?.page, params?.pageSize ?? 20)
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
  persistCache(CACHE_KEYS.users)
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
  persistCache(CACHE_KEYS.users)

  const profile: MerchantProfile = {
    userId: user.id,
    companyName: data.companyName,
    description: data.description ?? '',
    website: data.website,
    inviteCode: data.inviteCode,
    invitedAt: new Date().toISOString(),
  }
  mockMerchantProfiles.push(profile)
  persistCache(CACHE_KEYS.merchantProfiles)

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
  persistCache(CACHE_KEYS.apiKeys)
  return key
}

export function revokeApiKey(keyId: string, by: 'consumer' | 'merchant' | 'admin' = 'consumer'): ApiKey | undefined {
  const key = mockApiKeys.find((k) => k.id === keyId)
  if (!key || key.status !== 'active') return undefined
  key.status = 'revoked'
  key.revokedAt = new Date().toISOString()
  key.revokedBy = by
  persistCache(CACHE_KEYS.apiKeys)
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
  persistCache(CACHE_KEYS.projects)
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
  visibility?: Service['visibility']
}): Service {
  const service: Service = {
    id: uniqueId('svc'),
    merchantId: data.merchantId,
    merchantName: data.merchantName,
    name: data.name,
    description: data.description,
    type: data.type,
    status: 'pending_approval',
    visibility: data.visibility ?? 'public',
    category: data.category,
    pricing: data.pricing,
    rateLimitPerMinute: data.rateLimitPerMinute ?? 0,
    endpoint: data.endpoint,
    tags: data.tags ?? [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  mockServices.push(service)
  persistCache(CACHE_KEYS.services)
  return service
}

// Merchant — Update service
export function updateService(
  serviceId: string,
  data: Partial<Pick<Service, 'name' | 'description' | 'category' | 'tags' | 'visibility' | 'pricing' | 'rateLimitPerMinute' | 'endpoint'>>,
  actorId: string,
  actorName: string,
): Service | undefined {
  const service = mockServices.find((s) => s.id === serviceId)
  if (!service) return undefined
  Object.assign(service, data)
  service.updatedAt = new Date().toISOString()
  persistCache(CACHE_KEYS.services)
  addAuditLog('service.updated', actorId, actorName, serviceId, 'service', `Updated service ${service.name}`, 'merchant')
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

// Admin — Profiles
export function getMerchantProfile(userId: string): MerchantProfile | undefined {
  return mockMerchantProfiles.find((p) => p.userId === userId)
}

export function getConsumerProfile(userId: string): ConsumerProfile | undefined {
  return mockConsumerProfiles.find((p) => p.userId === userId)
}

// Admin — Merchant management
export function suspendMerchant(userId: string): User | undefined {
  const user = mockUsers.find((u) => u.id === userId)
  if (!user || user.status !== 'active') return undefined
  user.status = 'suspended'
  persistCache(CACHE_KEYS.users)
  addAuditLog('merchant.suspended', 'user-admin-1', 'Sarah Admin', userId, 'merchant', `Suspended merchant ${user.name}`)
  return user
}

export function unsuspendMerchant(userId: string): User | undefined {
  const user = mockUsers.find((u) => u.id === userId)
  if (!user || user.status !== 'suspended') return undefined
  user.status = 'active'
  persistCache(CACHE_KEYS.users)
  addAuditLog('merchant.unsuspended', 'user-admin-1', 'Sarah Admin', userId, 'merchant', `Unsuspended merchant ${user.name}`)
  return user
}

// Admin — Consumer management
export function blockConsumer(userId: string): User | undefined {
  const user = mockUsers.find((u) => u.id === userId)
  if (!user || user.status !== 'active') return undefined
  user.status = 'blocked'
  // Revoke all active API keys
  const keys = mockApiKeys.filter((k) => k.consumerId === userId && k.status === 'active')
  for (const key of keys) {
    key.status = 'revoked'
    key.revokedAt = new Date().toISOString()
    key.revokedBy = 'consumer'
  }
  persistCache(CACHE_KEYS.users)
  persistCache(CACHE_KEYS.apiKeys)
  addAuditLog('consumer.blocked', 'user-admin-1', 'Sarah Admin', userId, 'consumer', `Blocked consumer ${user.name}`)
  return user
}

export function unblockConsumer(userId: string): User | undefined {
  const user = mockUsers.find((u) => u.id === userId)
  if (!user || user.status !== 'blocked') return undefined
  user.status = 'active'
  persistCache(CACHE_KEYS.users)
  addAuditLog('consumer.unblocked', 'user-admin-1', 'Sarah Admin', userId, 'consumer', `Unblocked consumer ${user.name}`)
  return user
}

// Admin — Service approval
export function approveService(serviceId: string): Service | undefined {
  const service = mockServices.find((s) => s.id === serviceId)
  if (!service || service.status !== 'pending_approval') return undefined
  service.status = 'active'
  service.updatedAt = new Date().toISOString()
  persistCache(CACHE_KEYS.services)
  addAuditLog('service.approved', 'user-admin-1', 'Sarah Admin', serviceId, 'service', `Approved service ${service.name}`)
  return service
}

export function rejectService(serviceId: string): Service | undefined {
  const service = mockServices.find((s) => s.id === serviceId)
  if (!service || service.status !== 'pending_approval') return undefined
  service.status = 'rejected'
  service.updatedAt = new Date().toISOString()
  persistCache(CACHE_KEYS.services)
  addAuditLog('service.rejected', 'user-admin-1', 'Sarah Admin', serviceId, 'service', `Rejected service ${service.name}`)
  return service
}

// Admin — Access request approval
export function approveAccessRequest(requestId: string): AccessRequest | undefined {
  const request = mockAccessRequests.find((r) => r.id === requestId)
  if (!request || request.status !== 'pending') return undefined
  request.status = 'approved'
  request.resolvedAt = new Date().toISOString()
  request.resolvedBy = 'user-admin-1'
  persistCache(CACHE_KEYS.accessRequests)
  addAuditLog('access.approved', 'user-admin-1', 'Sarah Admin', requestId, 'access_request', `Approved access to ${request.serviceName}`)
  return request
}

export function denyAccessRequest(requestId: string): AccessRequest | undefined {
  const request = mockAccessRequests.find((r) => r.id === requestId)
  if (!request || request.status !== 'pending') return undefined
  request.status = 'denied'
  request.resolvedAt = new Date().toISOString()
  request.resolvedBy = 'user-admin-1'
  persistCache(CACHE_KEYS.accessRequests)
  addAuditLog('access.denied', 'user-admin-1', 'Sarah Admin', requestId, 'access_request', `Denied access to ${request.serviceName}`)
  return request
}

// Admin — Merchant invite
export function createMerchantInvite(email: string): { code: string; link: string } {
  const code = `INV-${Date.now()}`
  validInviteCodes.add(code)
  addAuditLog('merchant.invited', 'user-admin-1', 'Sarah Admin', email, 'merchant', `Invited ${email} as merchant`)
  return { code, link: `/register/merchant?code=${code}` }
}

// Consumption Endpoint Simulation
export function simulateConsumption(apiKeyValue: string, serviceId: string): ConsumptionResponse {
  const results: ValidationResult[] = []

  // Step 1: API Key Validation
  const key = mockApiKeys.find((k) => k.keyValue === apiKeyValue)
  if (!key) {
    results.push({ step: 'api_key_validation', passed: false, errorCode: 401, errorMessage: 'Invalid API key' })
    return { success: false, statusCode: 401, validationResults: results, errorMessage: 'Invalid API key' }
  }
  results.push({ step: 'api_key_validation', passed: true })

  // Step 2: TTL Check
  if (key.status === 'expired' || key.status === 'revoked') {
    results.push({ step: 'ttl_check', passed: false, errorCode: 403, errorMessage: key.status === 'expired' ? 'API key expired' : 'API key revoked' })
    return { success: false, statusCode: 403, validationResults: results, errorMessage: `API key ${key.status}` }
  }
  results.push({ step: 'ttl_check', passed: true })

  // Step 3: Service Authorization
  if (!key.serviceIds.includes(serviceId)) {
    results.push({ step: 'service_authorization', passed: false, errorCode: 403, errorMessage: 'Key not authorized for this service' })
    return { success: false, statusCode: 403, validationResults: results, errorMessage: 'Key not authorized for this service' }
  }
  results.push({ step: 'service_authorization', passed: true })

  // Step 3.5: Service Block Check
  const isBlocked = mockServiceBlocks.some(
    (b) => b.consumerId === key.consumerId && b.serviceId === serviceId,
  )
  if (isBlocked) {
    results.push({ step: 'service_block_check', passed: false, errorCode: 403, errorMessage: 'Consumer blocked for this service' })
    return { success: false, statusCode: 403, validationResults: results, errorMessage: 'Consumer blocked for this service' }
  }
  results.push({ step: 'service_block_check', passed: true })

  // Step 4: Merchant Config Check
  const service = mockServices.find((s) => s.id === serviceId)
  if (!service || !service.endpoint) {
    results.push({ step: 'merchant_config_check', passed: false, errorCode: 502, errorMessage: 'Merchant endpoint not configured' })
    return { success: false, statusCode: 502, validationResults: results, errorMessage: 'Merchant endpoint not configured' }
  }
  results.push({ step: 'merchant_config_check', passed: true })

  // Step 5: Rate Limit Check
  if (service.rateLimitPerMinute > 0) {
    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString()
    const recentUsage = mockUsageRecords.filter(
      (u) => u.serviceId === serviceId && u.apiKeyId === key.id && u.timestamp > oneMinuteAgo,
    )
    if (recentUsage.length >= service.rateLimitPerMinute) {
      results.push({ step: 'rate_limit_check', passed: false, errorCode: 429, errorMessage: 'Rate limit exceeded' })
      return { success: false, statusCode: 429, validationResults: results, errorMessage: 'Rate limit exceeded' }
    }
  }
  results.push({ step: 'rate_limit_check', passed: true })

  // All passed — create usage record
  const responseTimeMs = Math.floor(Math.random() * 200) + 20
  const usageRecord: UsageRecord = {
    id: `usage-${Date.now()}`,
    consumerId: key.consumerId,
    apiKeyId: key.id,
    serviceId,
    timestamp: new Date().toISOString(),
    requestPayloadSize: 256,
    responsePayloadSize: 1024,
    responseTimeMs,
    statusCode: 200,
  }
  mockUsageRecords.push(usageRecord)
  persistCache(CACHE_KEYS.usageRecords)

  return { success: true, statusCode: 200, validationResults: results, responseTimeMs }
}

// Merchant — All usage records across merchant's services
export function getUsageByMerchant(merchantId: string): UsageRecord[] {
  const merchantServiceIds = mockServices
    .filter((s) => s.merchantId === merchantId)
    .map((s) => s.id)
  return mockUsageRecords.filter((u) => merchantServiceIds.includes(u.serviceId))
}

// Consumer — Services with approved access
export function getConsumerApprovedServices(consumerId: string): Service[] {
  const approvedServiceIds = mockAccessRequests
    .filter((r) => r.consumerId === consumerId && r.status === 'approved')
    .map((r) => r.serviceId)
  return mockServices.filter((s) => approvedServiceIds.includes(s.id))
}

// Consumer — Per-service usage
export function getConsumerServiceUsage(
  consumerId: string,
  serviceId: string,
): { totalRequests: number; avgResponseTimeMs: number; records: UsageRecord[] } {
  const records = mockUsageRecords.filter(
    (u) => u.consumerId === consumerId && u.serviceId === serviceId,
  )
  const totalRequests = records.length
  const avgResponseTimeMs =
    totalRequests > 0
      ? Math.round(records.reduce((sum, r) => sum + r.responseTimeMs, 0) / totalRequests)
      : 0
  return { totalRequests, avgResponseTimeMs, records }
}

// Admin — Merchant lifecycle (4-state)
export function approveMerchantOnboarding(userId: string): User | undefined {
  const user = mockUsers.find((u) => u.id === userId)
  if (!user || user.status !== 'pending') return undefined
  user.status = 'active'
  persistCache(CACHE_KEYS.users)
  addAuditLog('merchant.approved', 'user-admin-1', 'Sarah Admin', userId, 'merchant', `Approved merchant onboarding for ${user.name}`)
  return user
}

export function rejectMerchantOnboarding(userId: string): User | undefined {
  const user = mockUsers.find((u) => u.id === userId)
  if (!user || user.status !== 'pending') return undefined
  user.status = 'disabled'
  persistCache(CACHE_KEYS.users)
  addAuditLog('merchant.rejected', 'user-admin-1', 'Sarah Admin', userId, 'merchant', `Rejected merchant onboarding for ${user.name}`)
  return user
}

export function disableMerchant(userId: string): User | undefined {
  const user = mockUsers.find((u) => u.id === userId)
  if (!user || (user.status !== 'active' && user.status !== 'suspended')) return undefined
  user.status = 'disabled'
  // Suspend all merchant services
  const merchantServices = mockServices.filter((s) => s.merchantId === userId && s.status === 'active')
  for (const svc of merchantServices) {
    svc.status = 'suspended'
    svc.updatedAt = new Date().toISOString()
  }
  if (merchantServices.length > 0) persistCache(CACHE_KEYS.services)
  persistCache(CACHE_KEYS.users)
  addAuditLog('merchant.disabled', 'user-admin-1', 'Sarah Admin', userId, 'merchant', `Disabled merchant ${user.name}`)
  return user
}

// Admin — Compliance controls
export function flagMerchantForReview(userId: string, flagged: boolean): MerchantProfile | undefined {
  const profile = mockMerchantProfiles.find((p) => p.userId === userId)
  if (!profile) return undefined
  profile.flaggedForReview = flagged
  persistCache(CACHE_KEYS.merchantProfiles)
  const user = mockUsers.find((u) => u.id === userId)
  const action = flagged ? 'merchant.flagged' : 'merchant.unflagged'
  const desc = flagged ? `Flagged merchant ${user?.name ?? userId} for review` : `Removed flag from merchant ${user?.name ?? userId}`
  addAuditLog(action, 'user-admin-1', 'Sarah Admin', userId, 'merchant', desc)
  return profile
}

export function blockMerchantSubscriptions(userId: string, blocked: boolean): MerchantProfile | undefined {
  const profile = mockMerchantProfiles.find((p) => p.userId === userId)
  if (!profile) return undefined
  profile.subscriptionsBlocked = blocked
  persistCache(CACHE_KEYS.merchantProfiles)
  const user = mockUsers.find((u) => u.id === userId)
  const action = blocked ? 'merchant.subscriptions_blocked' : 'merchant.subscriptions_unblocked'
  const desc = blocked ? `Blocked subscriptions for merchant ${user?.name ?? userId}` : `Unblocked subscriptions for merchant ${user?.name ?? userId}`
  addAuditLog(action, 'user-admin-1', 'Sarah Admin', userId, 'merchant', desc)
  return profile
}

// Admin — Credential control
export function adminRevokeApiKey(keyId: string): ApiKey | undefined {
  const key = mockApiKeys.find((k) => k.id === keyId)
  if (!key || key.status !== 'active') return undefined
  key.status = 'revoked'
  key.revokedAt = new Date().toISOString()
  key.revokedBy = 'admin'
  persistCache(CACHE_KEYS.apiKeys)
  addAuditLog('apikey.revoked', 'user-admin-1', 'Sarah Admin', keyId, 'apikey', `Admin revoked API key ${key.name}`)
  return key
}

export function adminRevokeAllConsumerKeys(consumerId: string): number {
  const keys = mockApiKeys.filter((k) => k.consumerId === consumerId && k.status === 'active')
  const now = new Date().toISOString()
  for (const key of keys) {
    key.status = 'revoked'
    key.revokedAt = now
    key.revokedBy = 'admin'
  }
  if (keys.length > 0) {
    persistCache(CACHE_KEYS.apiKeys)
    const user = mockUsers.find((u) => u.id === consumerId)
    addAuditLog('apikey.revoked', 'user-admin-1', 'Sarah Admin', consumerId, 'consumer', `Admin revoked all API keys for ${user?.name ?? consumerId}`)
  }
  return keys.length
}

export function forceRegenerateApiKey(keyId: string): ApiKey | undefined {
  const oldKey = mockApiKeys.find((k) => k.id === keyId)
  if (!oldKey) return undefined
  // Revoke old key
  oldKey.status = 'revoked'
  oldKey.revokedAt = new Date().toISOString()
  oldKey.revokedBy = 'admin'
  // Create new key with same config
  const newKey = createApiKey({
    consumerId: oldKey.consumerId,
    name: oldKey.name,
    description: oldKey.description,
    serviceIds: oldKey.serviceIds,
    ttlDays: oldKey.ttlDays,
  })
  addAuditLog('apikey.revoked', 'user-admin-1', 'Sarah Admin', keyId, 'apikey', `Admin force-regenerated API key ${oldKey.name}`)
  return newKey
}

// Docker Image lifecycle
export function deprecateImage(imageId: string, actorId: string, actorName: string): DockerImage | undefined {
  const image = mockDockerImages.find((i) => i.id === imageId)
  if (!image || image.status !== 'active') return undefined
  image.status = 'deprecated'
  persistCache(CACHE_KEYS.dockerImages)
  addAuditLog('image.deprecated', actorId, actorName, imageId, 'image', `Deprecated image ${image.name}:${image.tag}`, 'merchant')
  return image
}

export function disableImage(imageId: string, actorId: string, actorName: string): DockerImage | undefined {
  const image = mockDockerImages.find((i) => i.id === imageId)
  if (!image || image.status === 'disabled') return undefined
  image.status = 'disabled'
  persistCache(CACHE_KEYS.dockerImages)
  addAuditLog('image.disabled', actorId, actorName, imageId, 'image', `Disabled image ${image.name}:${image.tag}`, 'merchant')
  return image
}

// Per-service consumer blocking
export function blockConsumerForService(
  consumerId: string,
  serviceId: string,
  blockedBy: string,
  actorName: string,
): ServiceBlock {
  const block: ServiceBlock = {
    consumerId,
    serviceId,
    blockedAt: new Date().toISOString(),
    blockedBy,
  }
  mockServiceBlocks.push(block)
  persistCache(CACHE_KEYS.serviceBlocks)
  addAuditLog('consumer.service_blocked', blockedBy, actorName, consumerId, 'consumer', `Blocked consumer for service ${serviceId}`, 'merchant')
  return block
}

export function unblockConsumerForService(
  consumerId: string,
  serviceId: string,
  actorId: string,
  actorName: string,
): boolean {
  const index = mockServiceBlocks.findIndex(
    (b) => b.consumerId === consumerId && b.serviceId === serviceId,
  )
  if (index === -1) return false
  mockServiceBlocks.splice(index, 1)
  persistCache(CACHE_KEYS.serviceBlocks)
  addAuditLog('consumer.service_unblocked', actorId, actorName, consumerId, 'consumer', `Unblocked consumer for service ${serviceId}`, 'merchant')
  return true
}

export function getServiceBlocksForService(serviceId: string): ServiceBlock[] {
  return mockServiceBlocks.filter((b) => b.serviceId === serviceId)
}

export function isConsumerBlockedForService(consumerId: string, serviceId: string): boolean {
  return mockServiceBlocks.some(
    (b) => b.consumerId === consumerId && b.serviceId === serviceId,
  )
}

export function generatePullToken(consumerId: string, imageId: string): { token: string; expiresAt: string } {
  // Params reserved for future per-consumer/image token scoping
  void consumerId
  void imageId
  const randomPart = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
  const token = `ams_pull_${randomPart}`
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString()
  return { token, expiresAt }
}

// Audit log helper
function addAuditLog(
  action: AuditAction,
  actorId: string,
  actorName: string,
  targetId: string,
  targetType: AuditLog['targetType'],
  description: string,
  actorRole: string = 'admin',
): void {
  mockAuditLogs.push({
    id: `audit-${Date.now()}`,
    action,
    actorId,
    actorName,
    actorRole,
    targetId,
    targetType,
    description,
    timestamp: new Date().toISOString(),
  })
  persistCache(CACHE_KEYS.auditLogs)
}
