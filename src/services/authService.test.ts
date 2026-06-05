import { beforeEach, describe, expect, it, vi } from 'vitest'
import { login, logout, isTokenValid } from './authService'
import { getAuthState, resetAppStoreForTests, setAuthToken } from '../store/appStore'
import { apiRequest } from '../api/client'

const validToken = 'header.payload.signature'

function futureIsoTimestamp(): string {
  return new Date(Date.now() + 60_000).toISOString()
}

function pastIsoTimestamp(): string {
  return new Date(Date.now() - 60_000).toISOString()
}

describe('authService', () => {
  beforeEach(() => {
    resetAppStoreForTests()
    vi.restoreAllMocks()
  })

  it('returns false when token is missing', () => {
    expect(isTokenValid()).toBe(false)
  })

  it('returns false when token is expired', () => {
    setAuthToken(validToken, pastIsoTimestamp())

    expect(isTokenValid()).toBe(false)
  })

  it('returns true for a valid future token', () => {
    setAuthToken(validToken, futureIsoTimestamp())

    expect(isTokenValid()).toBe(true)
  })

  it('clears auth state on logout', () => {
    setAuthToken(validToken, futureIsoTimestamp())

    logout()

    expect(getAuthState()).toEqual({ token: null, expiresAt: null, isAuthenticated: false })
  })

  it('stores token after successful login', async () => {
    const expiresAt = futureIsoTimestamp()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ token: validToken, expiresAt }), { status: 200 })),
    )

    await login({ username: 'user', password: 'password' })

    expect(getAuthState()).toEqual({ token: validToken, expiresAt, isAuthenticated: true })
  })

  it('does not store token after failed login', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 401 })))

    await expect(login({ username: 'user', password: 'wrong' })).rejects.toMatchObject({
      category: 'auth',
      code: 'AUTH_TOKEN_EXPIRED',
    })
    expect(getAuthState()).toEqual({ token: null, expiresAt: null, isAuthenticated: false })
  })

  it('uses unauthenticated API request settings for login', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ token: validToken, expiresAt: futureIsoTimestamp() }), { status: 200 }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await login({ username: 'user', password: 'password' })

    const request = fetchMock.mock.calls[0][1] as RequestInit
    expect(request.headers).toBeInstanceOf(Headers)
    expect((request.headers as Headers).has('Authorization')).toBe(false)
    expect((request.headers as Headers).has('X-BrokerId')).toBe(false)
  })
})

describe('authService integration guard', () => {
  beforeEach(() => {
    resetAppStoreForTests()
    vi.restoreAllMocks()
  })

  it('keeps authenticated API calls protected after logout', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    setAuthToken(validToken, futureIsoTimestamp())
    logout()

    await expect(apiRequest('/api/protected', { brokerRequired: false })).rejects.toMatchObject({
      category: 'auth',
      code: 'AUTH_TOKEN_MISSING',
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
