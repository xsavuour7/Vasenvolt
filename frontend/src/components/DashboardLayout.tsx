import { useState, type ReactNode } from 'react'
import DashboardNavbar from './DashboardNavbar'
import DashboardSidebar from './DashboardSidebar'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar onMenuToggle={toggleSidebar} />
      <div className="flex">
        <DashboardSidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        <main className="flex-1 md:ml-64">
          <div className="p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

