import { getActiveBroker } from '../store/brokerStore'
import { clearAuthToken, getAuthState, jwtTokenPattern } from '../store/appStore'
import type { AuthErrorCode } from '../types/auth'
import type { ApiError } from '../types/common'

export interface RequestHeaderOptions {
  authRequired: boolean
  brokerRequired: boolean
  headers?: Record<string, string>
}

export function buildRequestHeaders(options: RequestHeaderOptions): Headers {
  const headers = new Headers(options.headers)

  headers.delete('Authorization')
  headers.delete('X-BrokerId')

  if (options.authRequired) {
    headers.set('Authorization', `Bearer ${getValidTokenOrThrow()}`)
  }

  if (options.brokerRequired) {
    const activeBroker = getActiveBroker()

    if (activeBroker === null) {
      throw createClientError('Active broker is required.', 'BROKER_REQUIRED')
    }

    headers.set('X-BrokerId', activeBroker.brokerId)
  }

  return headers
}

function getValidTokenOrThrow(): string {
  const { token, expiresAt } = getAuthState()

  if (token === null || token.length === 0) {
    throw createAuthError('AUTH_TOKEN_MISSING', 'Session token is missing.')
  }

  if (!jwtTokenPattern.test(token)) {
    throw createAuthError('AUTH_TOKEN_INVALID', 'Session token is invalid.')
  }

  if (expiresAt === null || Date.parse(expiresAt) <= Date.now()) {
    clearAuthToken()
    throw createAuthError('AUTH_TOKEN_EXPIRED', 'Session expired, please log in again.')
  }

  return token
}

function createAuthError(code: AuthErrorCode, message: string): ApiError {
  return {
    message,
    category: 'auth',
    code,
  }
}

function createClientError(message: string, code: string): ApiError {
  return {
    message,
    category: 'client',
    code,
  }
}
