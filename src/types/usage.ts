export interface UsageRecord {
  id: string
  consumerId: string
  apiKeyId: string
  serviceId: string
  timestamp: string
  requestPayloadSize: number
  responsePayloadSize: number
  responseTimeMs: number
  statusCode: number
}

export interface UsageStats {
  totalRequests: number
  totalCost: number
  avgResponseTimeMs: number
  errorRate: number
  periodStart: string
  periodEnd: string
}

export interface UsageByService {
  serviceId: string
  serviceName: string
  requestCount: number
  totalCost: number
  avgResponseTimeMs: number
}

export interface UsageByKey {
  apiKeyId: string
  keyName: string
  requestCount: number
  totalCost: number
}

export interface DailyUsage {
  date: string
  requestCount: number
  cost: number
  errorCount: number
}
