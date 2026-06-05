import type { AuthState, JwtToken } from '../types/auth'
import type { ValidationError, ValidationResult } from '../types/common'

export interface AuthStoreSuccess {
  success: true
  data: AuthState
  validation: ValidationResult
}

export interface AuthStoreFailure {
  success: false
  data: null
  validation: ValidationResult
}

export type AuthStoreResult = AuthStoreSuccess | AuthStoreFailure

export const jwtTokenPattern = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/

let authState: AuthState = createEmptyAuthState()

export function getAuthState(): AuthState {
  return cloneAuthState(authState)
}

export function setAuthToken(token: JwtToken, expiresAt: string): AuthStoreResult {
  const trimmedToken = token.trim()
  const trimmedExpiresAt = expiresAt.trim()
  const errors = validateAuthToken(trimmedToken, trimmedExpiresAt)

  if (errors.length > 0) {
    return createFailure(errors)
  }

  authState = {
    token: trimmedToken,
    expiresAt: trimmedExpiresAt,
    isAuthenticated: true,
  }

  return createSuccess(cloneAuthState(authState))
}

export function clearAuthToken(): AuthState {
  authState = createEmptyAuthState()

  return cloneAuthState(authState)
}

export function resetAppStoreForTests(): void {
  authState = createEmptyAuthState()
}

function validateAuthToken(token: JwtToken, expiresAt: string): ValidationError[] {
  const errors: ValidationError[] = []

  if (token.length === 0) {
    errors.push({ field: 'token', message: 'Token is required.', code: 'AUTH_TOKEN_MISSING' })
  } else if (!jwtTokenPattern.test(token)) {
    errors.push({ field: 'token', message: 'Token must be a valid JWT.', code: 'AUTH_TOKEN_INVALID' })
  }

  if (expiresAt.length === 0) {
    errors.push({ field: 'expiresAt', message: 'Expiration is required.', code: 'AUTH_EXPIRES_AT_MISSING' })
  } else if (!isFutureIsoTimestamp(expiresAt)) {
    errors.push({
      field: 'expiresAt',
      message: 'Expiration must be a future ISO timestamp.',
      code: 'AUTH_TOKEN_EXPIRED',
    })
  }

  return errors
}

function isFutureIsoTimestamp(value: string): boolean {
  const timestamp = Date.parse(value)

  return Number.isFinite(timestamp) && timestamp > Date.now()
}

function createEmptyAuthState(): AuthState {
  return {
    token: null,
    expiresAt: null,
    isAuthenticated: false,
  }
}

function cloneAuthState(state: AuthState): AuthState {
  return { ...state }
}

function createSuccess(data: AuthState): AuthStoreSuccess {
  return {
    success: true,
    data,
    validation: { isValid: true, errors: [] },
  }
}

function createFailure(errors: ValidationError[]): AuthStoreFailure {
  return {
    success: false,
    data: null,
    validation: { isValid: false, errors },
  }
}
