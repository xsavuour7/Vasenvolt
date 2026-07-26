import { AuthProvider } from './AuthContext'

export function useAuth() {
  const context = context(AuthProvider)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
