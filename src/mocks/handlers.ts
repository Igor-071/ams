import type { FilterParams, PaginatedResponse } from '@/types/common.ts'
import type { User, MerchantProfile, ConsumerProfile } from '@/types/user.ts'
import type { Service, AccessRequest } from '@/types/service.ts'
import type { ApiKey } from '@/types/api-key.ts'
import type { UsageRecord, DailyUsage } from '@/types/usage.ts'
import type { Invoice } from '@/types/invoice.ts'
import type { AuditLog, AuditAction } from '@/types/audit.ts'
import type { ConsumptionResponse, ValidationResult } from '@/types/consumption.ts'
import { mockUsers, mockMerchantProfiles, mockConsumerProfiles } from './data/users.ts'
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
    id: uniqueId('svc'),
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
  addAuditLog('merchant.suspended', 'user-admin-1', 'Sarah Admin', userId, 'merchant', `Suspended merchant ${user.name}`)
  return user
}

export function unsuspendMerchant(userId: string): User | undefined {
  const user = mockUsers.find((u) => u.id === userId)
  if (!user || user.status !== 'suspended') return undefined
  user.status = 'active'
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
  addAuditLog('consumer.blocked', 'user-admin-1', 'Sarah Admin', userId, 'consumer', `Blocked consumer ${user.name}`)
  return user
}

export function unblockConsumer(userId: string): User | undefined {
  const user = mockUsers.find((u) => u.id === userId)
  if (!user || user.status !== 'blocked') return undefined
  user.status = 'active'
  addAuditLog('consumer.unblocked', 'user-admin-1', 'Sarah Admin', userId, 'consumer', `Unblocked consumer ${user.name}`)
  return user
}

// Admin — Service approval
export function approveService(serviceId: string): Service | undefined {
  const service = mockServices.find((s) => s.id === serviceId)
  if (!service || service.status !== 'pending_approval') return undefined
  service.status = 'active'
  service.updatedAt = new Date().toISOString()
  addAuditLog('service.approved', 'user-admin-1', 'Sarah Admin', serviceId, 'service', `Approved service ${service.name}`)
  return service
}

export function rejectService(serviceId: string): Service | undefined {
  const service = mockServices.find((s) => s.id === serviceId)
  if (!service || service.status !== 'pending_approval') return undefined
  service.status = 'rejected'
  service.updatedAt = new Date().toISOString()
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
  addAuditLog('access.approved', 'user-admin-1', 'Sarah Admin', requestId, 'access_request', `Approved access to ${request.serviceName}`)
  return request
}

export function denyAccessRequest(requestId: string): AccessRequest | undefined {
  const request = mockAccessRequests.find((r) => r.id === requestId)
  if (!request || request.status !== 'pending') return undefined
  request.status = 'denied'
  request.resolvedAt = new Date().toISOString()
  request.resolvedBy = 'user-admin-1'
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

  return { success: true, statusCode: 200, validationResults: results, responseTimeMs }
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

// Admin — Audit log helper
function addAuditLog(
  action: AuditAction,
  actorId: string,
  actorName: string,
  targetId: string,
  targetType: AuditLog['targetType'],
  description: string,
): void {
  mockAuditLogs.push({
    id: `audit-${Date.now()}`,
    action,
    actorId,
    actorName,
    actorRole: 'admin',
    targetId,
    targetType,
    description,
    timestamp: new Date().toISOString(),
  })
}
