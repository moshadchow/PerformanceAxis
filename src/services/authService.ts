import { clearAuthToken, getAuthState, jwtTokenPattern, setAuthToken } from '../store/appStore'
import { clearCache } from './cacheService'
import type { LoginCredentials } from '../types/auth'
import { postLogin } from '../api/authApi'

export function isTokenValid(): boolean {
  const { token, expiresAt } = getAuthState()

  return token !== null && jwtTokenPattern.test(token) && expiresAt !== null && Date.parse(expiresAt) > Date.now()
}

export async function login(credentials: LoginCredentials): Promise<void> {
  const response = await postLogin(credentials)
  const result = setAuthToken(response.token, response.expiresAt)

  if (!result.success) {
    throw result.validation
  }
}

export function logout(): void {
  clearAuthToken()
  clearCache()
}
