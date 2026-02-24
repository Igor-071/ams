export type ServiceType = 'api' | 'docker'

export type ServiceVisibility = 'public' | 'private'

export type ServiceStatus =
  | 'draft'
  | 'pending_approval'
  | 'active'
  | 'rejected'
  | 'suspended'

export interface PricingModel {
  type: 'free' | 'per_request' | 'tiered' | 'flat'
  pricePerRequest?: number
  currency?: string
  freeTier?: number
  tiers?: PricingTier[]
}

export interface PricingTier {
  upTo: number
  pricePerRequest: number
}

export interface ServiceEndpointConfig {
  baseUrl: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  timeout?: number
}

export interface ServiceMetrics {
  totalRequests: number
  activeConsumers: number
  avgResponseTimeMs: number
  uptimePercent: number
  successRate: number
}

export interface QuickStartSnippet {
  language: string
  code: string
}

export interface Service {
  id: string
  merchantId: string
  merchantName: string
  name: string
  description: string
  type: ServiceType
  status: ServiceStatus
  visibility: ServiceVisibility
  category: string
  pricing: PricingModel
  rateLimitPerMinute: number
  endpoint?: ServiceEndpointConfig
  documentationUrl?: string
  tags: string[]
  createdAt: string
  updatedAt: string
  version?: string
  longDescription?: string
  features?: string[]
  quickStart?: QuickStartSnippet
  responseFormat?: string
  authMethod?: string
}

export interface AccessRequest {
  id: string
  consumerId: string
  consumerName: string
  serviceId: string
  serviceName: string
  status: 'pending' | 'approved' | 'denied'
  requestedAt: string
  resolvedAt?: string
  resolvedBy?: string
}
