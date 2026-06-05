export type JwtToken = string

export interface AuthState {
  token: JwtToken | null
  expiresAt: string | null
  isAuthenticated: boolean
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface LoginResponse {
  token: JwtToken
  expiresAt: string
}

export type AuthErrorCode = 'AUTH_TOKEN_MISSING' | 'AUTH_TOKEN_INVALID' | 'AUTH_TOKEN_EXPIRED'
