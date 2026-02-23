import type { UsageRecord, DailyUsage } from '@/types/usage.ts'
import { hmrCache } from './hmr-cache.ts'

export const mockUsageRecords: UsageRecord[] = hmrCache('__ams_usageRecords', () => [
  {
    id: 'usage-1',
    consumerId: 'user-consumer-1',
    apiKeyId: 'key-1',
    serviceId: 'svc-1',
    timestamp: '2025-04-20T10:30:00Z',
    requestPayloadSize: 256,
    responsePayloadSize: 1024,
    responseTimeMs: 45,
    statusCode: 200,
  },
  {
    id: 'usage-2',
    consumerId: 'user-consumer-1',
    apiKeyId: 'key-1',
    serviceId: 'svc-1',
    timestamp: '2025-04-20T11:00:00Z',
    requestPayloadSize: 128,
    responsePayloadSize: 2048,
    responseTimeMs: 120,
    statusCode: 200,
  },
  {
    id: 'usage-3',
    consumerId: 'user-consumer-1',
    apiKeyId: 'key-1',
    serviceId: 'svc-2',
    timestamp: '2025-04-20T12:15:00Z',
    requestPayloadSize: 512,
    responsePayloadSize: 4096,
    responseTimeMs: 230,
    statusCode: 200,
  },
  {
    id: 'usage-4',
    consumerId: 'user-consumer-1',
    apiKeyId: 'key-2',
    serviceId: 'svc-1',
    timestamp: '2025-04-20T14:00:00Z',
    requestPayloadSize: 64,
    responsePayloadSize: 512,
    responseTimeMs: 35,
    statusCode: 200,
  },
  {
    id: 'usage-5',
    consumerId: 'user-consumer-2',
    apiKeyId: 'key-4',
    serviceId: 'svc-1',
    timestamp: '2025-04-20T15:30:00Z',
    requestPayloadSize: 256,
    responsePayloadSize: 1024,
    responseTimeMs: 55,
    statusCode: 200,
  },
  {
    id: 'usage-6',
    consumerId: 'user-consumer-1',
    apiKeyId: 'key-1',
    serviceId: 'svc-1',
    timestamp: '2025-04-21T09:00:00Z',
    requestPayloadSize: 128,
    responsePayloadSize: 512,
    responseTimeMs: 500,
    statusCode: 500,
  },
])

function generateDailyUsage(): DailyUsage[] {
  // Deterministic seed-based pseudo-random for reproducible data
  let seed = 42
  function seededRandom() {
    seed = (seed * 16807 + 0) % 2147483647
    return (seed - 1) / 2147483646
  }

  const result: DailyUsage[] = []
  const start = new Date(2025, 0, 1) // Jan 1, 2025
  const end = new Date(2025, 3, 27)  // Apr 27, 2025

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay()
    // Lower traffic on weekends
    const weekendFactor = dayOfWeek === 0 || dayOfWeek === 6 ? 0.6 : 1.0
    // Gradual growth trend over time
    const dayIndex = Math.floor((d.getTime() - start.getTime()) / 86400000)
    const growthFactor = 1 + dayIndex * 0.005

    const baseRequests = 100 + seededRandom() * 200
    const requestCount = Math.round(baseRequests * weekendFactor * growthFactor)
    const cost = Math.round(requestCount * 0.001 * 100) / 100
    const errorCount = seededRandom() < 0.3 ? Math.round(seededRandom() * 5) : 0

    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')

    result.push({ date: `${yyyy}-${mm}-${dd}`, requestCount, cost, errorCount })
  }

  return result
}

export const mockDailyUsage: DailyUsage[] = hmrCache('__ams_dailyUsage', generateDailyUsage)

// Cache generated records per date to avoid re-generation
const dateRecordsCache = new Map<string, UsageRecord[]>()

function seededPrng(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

function hashDateString(date: string): number {
  let hash = 0
  for (let i = 0; i < date.length; i++) {
    hash = (hash * 31 + date.charCodeAt(i)) | 0
  }
  return Math.abs(hash) || 1
}

const consumerIds = ['user-consumer-1', 'user-consumer-2', 'user-consumer-3']
const apiKeyIds = ['key-1', 'key-2', 'key-3', 'key-4']
const serviceIds = ['svc-1', 'svc-2', 'svc-3', 'svc-4']

export function generateUsageRecordsForDate(date: string): UsageRecord[] {
  const cached = dateRecordsCache.get(date)
  if (cached) return cached

  const dailyEntry = mockDailyUsage.find((d) => d.date === date)
  if (!dailyEntry) return []

  const { requestCount, errorCount } = dailyEntry
  const rand = seededPrng(hashDateString(date))
  const records: UsageRecord[] = []

  for (let i = 0; i < requestCount; i++) {
    const isError = i < errorCount
    const hour = Math.floor(rand() * 24)
    const minute = Math.floor(rand() * 60)
    const second = Math.floor(rand() * 60)

    const hh = String(hour).padStart(2, '0')
    const mm = String(minute).padStart(2, '0')
    const ss = String(second).padStart(2, '0')

    records.push({
      id: `usage-gen-${date}-${i}`,
      consumerId: consumerIds[Math.floor(rand() * consumerIds.length)],
      apiKeyId: apiKeyIds[Math.floor(rand() * apiKeyIds.length)],
      serviceId: serviceIds[Math.floor(rand() * serviceIds.length)],
      timestamp: `${date}T${hh}:${mm}:${ss}Z`,
      requestPayloadSize: Math.floor(rand() * 4096) + 64,
      responsePayloadSize: Math.floor(rand() * 8192) + 128,
      responseTimeMs: Math.floor(rand() * 400) + 20,
      statusCode: isError
        ? [400, 401, 403, 429, 500, 502][Math.floor(rand() * 6)]
        : 200,
    })
  }

  // Sort by timestamp
  records.sort((a, b) => a.timestamp.localeCompare(b.timestamp))

  dateRecordsCache.set(date, records)
  return records
}
