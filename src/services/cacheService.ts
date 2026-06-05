import type { ApiCacheKeyParts } from '../types/api'

export interface CacheEntry<TData> {
  data: TData
  createdAt: number
  expiresAt: number
}

const defaultTtlMs = 60_000
const maxCacheEntries = 100
const cacheEntries = new Map<string, CacheEntry<unknown>>()

export function getCachedValue<TData>(key: string): TData | null {
  const entry = cacheEntries.get(key)

  if (entry === undefined) {
    return null
  }

  if (entry.expiresAt <= Date.now()) {
    cacheEntries.delete(key)
    return null
  }

  cacheEntries.delete(key)
  cacheEntries.set(key, entry)

  return entry.data as TData
}

export function setCachedValue<TData>(key: string, data: TData, ttlMs = defaultTtlMs): void {
  cacheEntries.delete(key)
  cacheEntries.set(key, {
    data,
    createdAt: Date.now(),
    expiresAt: Date.now() + ttlMs,
  })

  evictOldestEntries()
}

export function deleteCachedValue(key: string): void {
  cacheEntries.delete(key)
}

export function clearCache(): void {
  cacheEntries.clear()
}

export function resetCacheForTests(): void {
  clearCache()
}

export function createApiCacheKey(parts: ApiCacheKeyParts): string {
  return Object.entries(parts)
    .filter(([, value]) => value !== undefined && value !== null)
    .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&')
}

function evictOldestEntries(): void {
  while (cacheEntries.size > maxCacheEntries) {
    const oldestKey = cacheEntries.keys().next().value as string | undefined

    if (oldestKey === undefined) {
      return
    }

    cacheEntries.delete(oldestKey)
  }
}
