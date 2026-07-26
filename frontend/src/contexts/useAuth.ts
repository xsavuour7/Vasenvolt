import { useContext } from 'react'
import { AuthProvider } from './AuthContext'
import { AuthContext } from './'

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
