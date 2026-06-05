import { describe, expect, it, vi, beforeEach } from 'vitest'
import {
  clearCache,
  createApiCacheKey,
  deleteCachedValue,
  getCachedValue,
  resetCacheForTests,
  setCachedValue,
} from './cacheService'

describe('cacheService', () => {
  beforeEach(() => {
    resetCacheForTests()
    vi.useRealTimers()
  })

  it('stores and returns cached values', () => {
    setCachedValue('key', { value: 1 })

    expect(getCachedValue<{ value: number }>('key')).toEqual({ value: 1 })
  })

  it('returns null for missing values', () => {
    expect(getCachedValue('missing')).toBeNull()
  })

  it('expires stale values by TTL', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-06T12:00:00.000Z'))
    setCachedValue('key', 'value', 100)

    vi.setSystemTime(new Date('2026-06-06T12:00:00.101Z'))

    expect(getCachedValue('key')).toBeNull()
  })

  it('deletes individual cached values', () => {
    setCachedValue('key', 'value')

    deleteCachedValue('key')

    expect(getCachedValue('key')).toBeNull()
  })

  it('clears all cached values', () => {
    setCachedValue('one', 1)
    setCachedValue('two', 2)

    clearCache()

    expect(getCachedValue('one')).toBeNull()
    expect(getCachedValue('two')).toBeNull()
  })

  it('creates stable cache keys independent of property order', () => {
    expect(createApiCacheKey({ endpoint: 'broker-summary', brokerId: '1', fromDate: '2026-01-01' })).toBe(
      createApiCacheKey({ fromDate: '2026-01-01', brokerId: '1', endpoint: 'broker-summary' }),
    )
  })

  it('omits null and undefined cache key parts', () => {
    expect(createApiCacheKey({ endpoint: 'market-trade-info', brokerId: undefined, stockExchange: null })).toBe(
      'endpoint=market-trade-info',
    )
  })

  it('evicts oldest entries after max cache size', () => {
    for (let index = 0; index < 101; index += 1) {
      setCachedValue(`key-${index}`, index)
    }

    expect(getCachedValue('key-0')).toBeNull()
    expect(getCachedValue('key-100')).toBe(100)
  })
})
