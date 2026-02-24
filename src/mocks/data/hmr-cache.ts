/**
 * Cache data on window to survive Vite HMR re-evaluations,
 * and on sessionStorage to survive full page reloads.
 *
 * Priority: window (HMR) > sessionStorage (page reload) > init() (seed data)
 */
const _win = window as unknown as Record<string, unknown>

const STORAGE_PREFIX = 'ams-mock:'

/** All cache keys used by mock data modules */
export const CACHE_KEYS = {
  users: '__ams_users',
  merchantProfiles: '__ams_merchantProfiles',
  consumerProfiles: '__ams_consumerProfiles',
  services: '__ams_services',
  accessRequests: '__ams_accessRequests',
  apiKeys: '__ams_apiKeys',
  usageRecords: '__ams_usageRecords',
  dailyUsage: '__ams_dailyUsage',
  invoices: '__ams_invoices',
  auditLogs: '__ams_auditLogs',
  dockerImages: '__ams_dockerImages',
  projects: '__ams_projects',
  serviceBlocks: '__ams_serviceBlocks',
} as const

export function hmrCache<T>(key: string, init: () => T): T {
  // 1. Window cache (survives HMR)
  if (_win[key]) return _win[key] as T

  // 2. sessionStorage (survives page reload)
  try {
    const stored = sessionStorage.getItem(`${STORAGE_PREFIX}${key}`)
    if (stored) {
      const parsed = JSON.parse(stored) as T
      _win[key] = parsed
      return parsed
    }
  } catch {
    // Corrupted or unavailable — fall through to init
  }

  // 3. Seed data
  _win[key] = init()
  return _win[key] as T
}

/** Persist a cached array to sessionStorage so it survives page reloads */
export function persistCache(key: string): void {
  try {
    const data = _win[key]
    if (data !== undefined) {
      sessionStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(data))
    }
  } catch {
    // sessionStorage full or unavailable — silently ignore
  }
}
