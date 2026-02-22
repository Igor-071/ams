import { describe, it, expect, beforeEach } from 'vitest'
import { hmrCache, persistCache, CACHE_KEYS } from '../data/hmr-cache.ts'

const _win = window as unknown as Record<string, unknown>

describe('hmrCache', () => {
  const TEST_KEY = '__ams_test_cache'

  beforeEach(() => {
    delete _win[TEST_KEY]
    sessionStorage.removeItem(`ams-mock:${TEST_KEY}`)
  })

  it('returns init() value on first call', () => {
    const result = hmrCache(TEST_KEY, () => [1, 2, 3])
    expect(result).toEqual([1, 2, 3])
  })

  it('returns window-cached value on second call (HMR)', () => {
    const first = hmrCache(TEST_KEY, () => [1, 2, 3])
    first.push(4)
    const second = hmrCache(TEST_KEY, () => [99])
    expect(second).toEqual([1, 2, 3, 4])
  })

  it('persistCache saves to sessionStorage', () => {
    hmrCache(TEST_KEY, () => ['a', 'b'])
    persistCache(TEST_KEY)
    const stored = sessionStorage.getItem(`ams-mock:${TEST_KEY}`)
    expect(stored).not.toBeNull()
    expect(JSON.parse(stored!)).toEqual(['a', 'b'])
  })

  it('restores from sessionStorage when window cache is empty (page reload)', () => {
    // Simulate: data was persisted in a previous session
    sessionStorage.setItem(`ams-mock:${TEST_KEY}`, JSON.stringify(['restored']))
    // Window cache is empty (simulating page reload)
    const result = hmrCache(TEST_KEY, () => ['seed'])
    expect(result).toEqual(['restored'])
  })

  it('prefers window cache over sessionStorage', () => {
    _win[TEST_KEY] = ['from-window']
    sessionStorage.setItem(`ams-mock:${TEST_KEY}`, JSON.stringify(['from-storage']))
    const result = hmrCache(TEST_KEY, () => ['seed'])
    expect(result).toEqual(['from-window'])
  })

  it('falls back to init() on corrupted sessionStorage', () => {
    sessionStorage.setItem(`ams-mock:${TEST_KEY}`, 'not-valid-json{{{')
    const result = hmrCache(TEST_KEY, () => ['fallback'])
    expect(result).toEqual(['fallback'])
  })

  it('CACHE_KEYS contains all expected keys', () => {
    expect(Object.keys(CACHE_KEYS)).toEqual(
      expect.arrayContaining([
        'users',
        'services',
        'apiKeys',
        'accessRequests',
        'auditLogs',
        'invoices',
        'usageRecords',
        'projects',
        'dockerImages',
        'merchantProfiles',
        'consumerProfiles',
        'dailyUsage',
      ]),
    )
  })
})

describe('hmrCache integration: service creation survives simulated reload', () => {
  it('created+approved service persists through window cache clear', () => {
    const INTEGRATION_KEY = '__ams_test_integration'
    delete _win[INTEGRATION_KEY]
    sessionStorage.removeItem(`ams-mock:${INTEGRATION_KEY}`)

    // Simulate creating a service (push to cached array)
    const services = hmrCache<Record<string, string>[]>(INTEGRATION_KEY, () => [])
    const newService = { id: 'svc-test', name: 'Test Service', status: 'active' }
    services.push(newService)
    persistCache(INTEGRATION_KEY)

    // Simulate page reload: clear window cache
    delete _win[INTEGRATION_KEY]

    // Re-init from sessionStorage
    const reloaded = hmrCache<Record<string, string>[]>(INTEGRATION_KEY, () => [])
    expect(reloaded).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'svc-test' })]))
  })
})
