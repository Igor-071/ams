/**
 * Cache data on window to survive Vite HMR re-evaluations.
 * Without this, any file edit triggers HMR which re-evaluates data modules,
 * creating fresh arrays and losing dynamically pushed items.
 */
const _win = window as unknown as Record<string, unknown>

export function hmrCache<T>(key: string, init: () => T): T {
  if (!_win[key]) _win[key] = init()
  return _win[key] as T
}
