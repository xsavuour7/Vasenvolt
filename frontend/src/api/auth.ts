import { apiClient } from './client'

export interface LoginRequest {
  email: string
  password: string
}

export interface SignupRequest {
  email: string
  username: string
  password: string
  first_name?: string
  last_name?: string
  phone?: string
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  refresh_expires_in: number
  user_id: number
  email: string
  username: string
}

export interface User {
  id: number
  email: string
  username: string
  first_name?: string
  last_name?: string
  phone?: string
  is_active: boolean
  is_verified: boolean
  is_admin: boolean
  tenant_id?: number
  created_at: string
  updated_at?: string
}

export interface LogoutRequest {
  refresh_token: string
}

export interface LogoutResponse {
  message: string
}

export const authApi = {
  async login(credentials: LoginRequest): Promise<TokenResponse> {
    return apiClient.post<TokenResponse>('/auth/login', credentials)
  },

  async signup(userData: SignupRequest): Promise<TokenResponse> {
    return apiClient.post<TokenResponse>('/auth/signup', userData)
  },

  async logout(refreshToken: string): Promise<LogoutResponse> {
    return apiClient.post<LogoutResponse>('/auth/logout', {
      refresh_token: refreshToken,
    })
  },

  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>('/auth/me')
  },
}

