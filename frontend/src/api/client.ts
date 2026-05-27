
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export interface ApiError {
  detail: string | Array<{ loc: string[]; msg: string; type: string }>
}

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private getAccessToken(): string | null {
    return localStorage.getItem('access_token')
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token')
  }

  private setAccessToken(token: string): void {
    localStorage.setItem('access_token', token)
  }

  private setRefreshToken(token: string): void {
    localStorage.setItem('refresh_token', token)
  }

  private clearTokens(): void {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }

  private async refreshAccessToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      return false
    }

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      })

      if (response.ok) {
        const data = await response.json()
        this.setAccessToken(data.access_token)
        if (data.refresh_token) {
          this.setRefreshToken(data.refresh_token)
        }
        return true

      }
  

      
      return false
    } catch {
      return false
    }
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const accessToken = this.getAccessToken()

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        ...options.headers,
      },
    }

    try {
      let response = await fetch(url, config)

      // If 401 and we have a refresh token, try to refresh
      if (response.status === 401 && this.getRefreshToken()) {
        const refreshed = await this.refreshAccessToken()
        if (refreshed) {
          // Retry the original request with new token
          const newAccessToken = this.getAccessToken()
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${newAccessToken}`,
          }
          response = await fetch(url, config)
        } else {
          // Refresh failed, clear tokens and redirect to login
          this.clearTokens()
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
          throw new Error('Session expired. Please login again.')
        }
      }

      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({
          detail: `HTTP error! status: ${response.status}`,
        }))
        throw errorData
      }

      return await response.json()
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('An unexpected error occurred')
    }
  }

  // Helper methods for common HTTP verbs
  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  async post<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)

