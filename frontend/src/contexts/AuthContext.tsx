import { createContext, useState, useEffect, type ReactNode } from 'react'
import { authApi, type TokenResponse, type User } from '../api/auth'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (userData: {
    email: string
    username: string
    password: string
    first_name?: string
    last_name?: string
    phone?: string
  }) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user

  // Load user from token on mount
  useEffect(() => {
    const loadUser = async () => {
      const accessToken = localStorage.getItem('access_token')
      if (!accessToken) {
        setIsLoading(false)
        return
      }

      try {
        const userData = await authApi.getCurrentUser()
        setUser(userData)
      } catch {
        // Token invalid, clear it
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  const login = async (email: string, password: string) => {
    const response: TokenResponse = await authApi.login({ email, password })
    
    // Store tokens
    localStorage.setItem('access_token', response.access_token)
    localStorage.setItem('refresh_token', response.refresh_token)

    // Fetch and set user data
    const userData = await authApi.getCurrentUser()
    setUser(userData)
  }

  const signup = async (userData: {
    email: string
    username: string
    password: string
    first_name?: string
    last_name?: string
    phone?: string
  }) => {
    const response: TokenResponse = await authApi.signup(userData)
    
    // Store tokens
    localStorage.setItem('access_token', response.access_token)
    localStorage.setItem('refresh_token', response.refresh_token)

    // Fetch and set user data
    const userInfo = await authApi.getCurrentUser()
    setUser(userInfo)
  }

  const logout = async () => {
    const refreshToken = localStorage.getItem('refresh_token')
    
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken)
      } catch (error) {
        // Even if logout fails, clear local state
        console.error('Logout error:', error)
      }
    }

    // Clear tokens and user
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
  }

  const refreshUser = async () => {
    try {
      const userData = await authApi.getCurrentUser()
      setUser(userData)
    } catch {
      // If refresh fails, logout
      await logout()
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        signup,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}


