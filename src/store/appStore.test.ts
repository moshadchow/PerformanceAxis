import { beforeEach, describe, expect, it } from 'vitest'
import {
  clearAuthToken,
  getAuthState,
  resetAppStoreForTests,
  setAuthToken,
} from './appStore'

const validToken = 'header.payload.signature'

function futureIsoTimestamp(): string {
  return new Date(Date.now() + 60_000).toISOString()
}

function pastIsoTimestamp(): string {
  return new Date(Date.now() - 60_000).toISOString()
}

describe('appStore', () => {
  beforeEach(() => {
    resetAppStoreForTests()
  })

  it('starts unauthenticated', () => {
    expect(getAuthState()).toEqual({ token: null, expiresAt: null, isAuthenticated: false })
  })

  it('stores a valid token and expiration', () => {
    const expiresAt = futureIsoTimestamp()
    const result = setAuthToken(validToken, expiresAt)

    expect(result.success).toBe(true)
    expect(result.data).toEqual({ token: validToken, expiresAt, isAuthenticated: true })
    expect(getAuthState()).toEqual({ token: validToken, expiresAt, isAuthenticated: true })
  })

  it('trims token and expiration before storing', () => {
    const expiresAt = futureIsoTimestamp()

    setAuthToken(` ${validToken} `, ` ${expiresAt} `)

    expect(getAuthState()).toEqual({ token: validToken, expiresAt, isAuthenticated: true })
  })

  it('rejects a missing token', () => {
    const result = setAuthToken(' ', futureIsoTimestamp())

    expect(result.success).toBe(false)
    expect(result.validation.errors).toEqual([
      { field: 'token', message: 'Token is required.', code: 'AUTH_TOKEN_MISSING' },
    ])
    expect(getAuthState()).toEqual({ token: null, expiresAt: null, isAuthenticated: false })
  })

  it('rejects an invalid JWT format', () => {
    const result = setAuthToken('not-a-jwt', futureIsoTimestamp())

    expect(result.success).toBe(false)
    expect(result.validation.errors).toEqual([
      { field: 'token', message: 'Token must be a valid JWT.', code: 'AUTH_TOKEN_INVALID' },
    ])
  })

  it('rejects an expired token', () => {
    const result = setAuthToken(validToken, pastIsoTimestamp())

    expect(result.success).toBe(false)
    expect(result.validation.errors).toEqual([
      {
        field: 'expiresAt',
        message: 'Expiration must be a future ISO timestamp.',
        code: 'AUTH_TOKEN_EXPIRED',
      },
    ])
  })

  it('clears token state', () => {
    setAuthToken(validToken, futureIsoTimestamp())

    expect(clearAuthToken()).toEqual({ token: null, expiresAt: null, isAuthenticated: false })
    expect(getAuthState()).toEqual({ token: null, expiresAt: null, isAuthenticated: false })
  })

  it('returns defensive auth state copies', () => {
    setAuthToken(validToken, futureIsoTimestamp())
    const state = getAuthState()

    state.token = 'changed.payload.signature'

    expect(getAuthState().token).toBe(validToken)
  })
})
