import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiRequest, resetApiClientForTests } from './client'
import { getAuthState, resetAppStoreForTests, setAuthToken } from '../store/appStore'
import { addBroker, resetBrokerStoreForTests } from '../store/brokerStore'
import { getCachedValue, resetCacheForTests, setCachedValue } from '../services/cacheService'

const validToken = 'header.payload.signature'

function futureIsoTimestamp(): string {
  return new Date(Date.now() + 60_000).toISOString()
}

function pastIsoTimestamp(): string {
  return new Date(Date.now() - 60_000).toISOString()
}

describe('apiRequest', () => {
  beforeEach(() => {
    resetAppStoreForTests()
    resetBrokerStoreForTests()
    resetCacheForTests()
    resetApiClientForTests()
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('blocks authenticated requests when token is missing before fetch runs', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    await expect(apiRequest('/api/protected', { brokerRequired: false })).rejects.toMatchObject({
      category: 'auth',
      code: 'AUTH_TOKEN_MISSING',
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('blocks expired tokens before fetch runs and clears auth state', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    setAuthToken(validToken, pastIsoTimestamp())

    await expect(apiRequest('/api/protected', { brokerRequired: false })).rejects.toMatchObject({
      category: 'auth',
      code: 'AUTH_TOKEN_MISSING',
    })
    expect(fetchMock).not.toHaveBeenCalled()
    expect(getAuthState()).toEqual({ token: null, expiresAt: null, isAuthenticated: false })
  })

  it('blocks broker-required requests when active broker is missing before fetch runs', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    setAuthToken(validToken, futureIsoTimestamp())

    await expect(apiRequest('/api/protected')).rejects.toMatchObject({
      category: 'client',
      code: 'BROKER_REQUIRED',
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('blocks unsafe API paths before fetch runs', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      apiRequest('https://example.com/api/protected', { authRequired: false, brokerRequired: false }),
    ).rejects.toMatchObject({ category: 'client', code: 'INVALID_API_PATH' })
    await expect(apiRequest('//evil.test/path', { authRequired: false, brokerRequired: false })).rejects.toMatchObject({
      category: 'client',
      code: 'INVALID_API_PATH',
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('injects authorization and broker headers for authenticated requests', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    const brokerId = 'broker-1'
    setAuthToken(validToken, futureIsoTimestamp())
    addBroker({ key: 'SNM', brokerId })

    await expect(apiRequest<{ ok: boolean }>('/api/protected')).resolves.toEqual({ ok: true })

    const request = fetchMock.mock.calls[0][1] as RequestInit
    expect(request.headers).toBeInstanceOf(Headers)
    expect((request.headers as Headers).get('Authorization')).toBe(`Bearer ${validToken}`)
    expect((request.headers as Headers).get('X-BrokerId')).toBe(brokerId)
  })

  it('prevents callers from overriding sensitive headers', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    const brokerId = 'broker-1'
    setAuthToken(validToken, futureIsoTimestamp())
    addBroker({ key: 'SNM', brokerId })

    await apiRequest('/api/protected', {
      headers: { Authorization: 'Bearer override.token.value', 'X-BrokerId': 'override' },
    })

    const request = fetchMock.mock.calls[0][1] as RequestInit
    expect((request.headers as Headers).get('Authorization')).toBe(`Bearer ${validToken}`)
    expect((request.headers as Headers).get('X-BrokerId')).toBe(brokerId)
  })

  it('skips auth and broker headers when disabled', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    await apiRequest('/api/public', { authRequired: false, brokerRequired: false })

    const request = fetchMock.mock.calls[0][1] as RequestInit
    expect((request.headers as Headers).has('Authorization')).toBe(false)
    expect((request.headers as Headers).has('X-BrokerId')).toBe(false)
  })

  it('serializes query parameters and JSON body', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    await apiRequest('/api/public', {
      method: 'POST',
      query: { fromDate: '2026-01-01', skip: undefined, active: true },
      body: { name: 'value' },
      authRequired: false,
      brokerRequired: false,
    })

    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://uat.xfltrade.com:20121/api/public?active=true&fromDate=2026-01-01',
    )
    const request = fetchMock.mock.calls[0][1] as RequestInit
    expect(request.method).toBe('POST')
    expect(request.body).toBe(JSON.stringify({ name: 'value' }))
    expect((request.headers as Headers).get('Content-Type')).toBe('application/json')
  })

  it('clears auth state and cache on 401 responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 401 })))
    setAuthToken(validToken, futureIsoTimestamp())
    addBroker({ key: 'SNM', brokerId: 'broker-1' })
    setCachedValue('protected', { data: 'cached' })

    await expect(apiRequest('/api/protected')).rejects.toMatchObject({
      category: 'auth',
      code: 'AUTH_TOKEN_EXPIRED',
    })
    expect(getAuthState()).toEqual({ token: null, expiresAt: null, isAuthenticated: false })
    expect(getCachedValue('protected')).toBeNull()
  })

  it('normalizes server errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 500 })))

    await expect(
      apiRequest('/api/server-error', { authRequired: false, brokerRequired: false }),
    ).rejects.toMatchObject({ category: 'server', statusCode: 500 })
  })

  it('normalizes network errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))

    await expect(
      apiRequest('/api/network-error', { authRequired: false, brokerRequired: false }),
    ).rejects.toMatchObject({ category: 'network', message: 'Network request failed.' })
  })

  it('normalizes abort errors as cancelled', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new DOMException('aborted', 'AbortError')))

    await expect(
      apiRequest('/api/cancelled', { authRequired: false, brokerRequired: false }),
    ).rejects.toMatchObject({ category: 'cancelled', code: 'REQUEST_CANCELLED' })
  })

  it('handles empty successful responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 205 })))

    await expect(apiRequest('/api/empty', { authRequired: false, brokerRequired: false })).resolves.toBeUndefined()
  })

  it('deduplicates identical in-flight GET requests', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    const first = apiRequest('/api/public', { authRequired: false, brokerRequired: false, cacheKey: 'public' })
    const second = apiRequest('/api/public', { authRequired: false, brokerRequired: false, cacheKey: 'public' })

    await expect(Promise.all([first, second])).resolves.toEqual([{ ok: true }, { ok: true }])
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('does not deduplicate mutating requests', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    await Promise.all([
      apiRequest('/api/public', {
        method: 'POST',
        body: { request: 1 },
        authRequired: false,
        brokerRequired: false,
      }),
      apiRequest('/api/public', {
        method: 'POST',
        body: { request: 2 },
        authRequired: false,
        brokerRequired: false,
      }),
    ])

    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('returns cached GET responses without a second fetch', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    await apiRequest('/api/public', { authRequired: false, brokerRequired: false, cacheKey: 'public' })
    await apiRequest('/api/public', { authRequired: false, brokerRequired: false, cacheKey: 'public' })

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('refetches after cache TTL expires', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-06T12:00:00.000Z'))
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ value: 1 }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ value: 2 }), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      apiRequest('/api/public', { authRequired: false, brokerRequired: false, cacheKey: 'public', cacheTtlMs: 100 }),
    ).resolves.toEqual({ value: 1 })
    vi.setSystemTime(new Date('2026-06-06T12:00:00.101Z'))
    await expect(
      apiRequest('/api/public', { authRequired: false, brokerRequired: false, cacheKey: 'public', cacheTtlMs: 100 }),
    ).resolves.toEqual({ value: 2 })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
