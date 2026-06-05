import type { LoginCredentials, LoginResponse } from '../types/auth'
import { apiRequest } from './client'

export function postLogin(credentials: LoginCredentials): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: credentials,
    authRequired: false,
    brokerRequired: false,
  })
}
