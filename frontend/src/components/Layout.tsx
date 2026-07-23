import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/'
import DashboardLayout from './DashboardLayout'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  // Check if current route is a dashboard route
  const isDashboardRoute = location.pathname.startsWith('/dashboard')

  // Use DashboardLayout for authenticated dashboard routes
  if (isAuthenticated && isDashboardRoute) {
    return <DashboardLayout>{children}</DashboardLayout>
  }

  // Use simple layout for auth pages
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/">
              <h1 className="text-2xl font-bold text-foreground">VasenVolt</h1>
            </Link>
            <nav className="flex items-center gap-4">
              <Link
                to="/login"
                className="rounded-md px-4 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Sign Up
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}

