'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Zap,
  BarChart2,
  Lightbulb,
  FileText,
  Settings,
  Menu,
  X,
  Bell,
  Search,
} from 'lucide-react';
import { UserProfile } from '@/components/user/user-profile';
import { useAuth } from '@/lib/firebase/auth/context';
import { ProtectedContent } from '@/components/auth/protected-content';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Devices',
    href: '/devices',
    icon: Zap,
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart2,
  },
  {
    name: 'Recommendations',
    href: '/recommendations',
    icon: Lightbulb,
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: FileText,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  // Filter navigation based on authentication status
  const filteredNavigation = navigation.filter(item => {
    if (!user) return false;
    if (user.isAnonymous) {
      // Hide certain routes for anonymous users
      return !['Settings'].includes(item.name);
    }
    return true;
  });

  return (
    <ProtectedContent>
      <div className="min-h-screen bg-background">
        {/* Mobile sidebar */}
        <div
          className={`fixed inset-0 z-40 lg:hidden ${
            sidebarOpen ? 'block' : 'hidden'
          }`}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-background">
            <div className="flex h-16 items-center justify-between px-4">
              <Link href="/" className="text-xl font-bold hover:text-primary transition-colors">
                VasenVolt
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            <nav className="flex-1 space-y-1 px-2 py-4">
              {filteredNavigation.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Desktop sidebar */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
          <div className="flex h-16 items-center justify-between px-4">
            <Link href="/" className="text-xl font-bold hover:text-primary transition-colors">
              VasenVolt
            </Link>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 lg:pl-64 lg:pr-16">
          <div className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>

            <div className="flex flex-1 items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full rounded-lg border bg-background py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          <main className="p-4">{children}</main>
        </div>

        {/* Right sidebar */}
        <div className="hidden lg:fixed lg:right-0 lg:top-0 lg:flex lg:h-full lg:w-16 lg:flex-col lg:border-l">
          <div className="flex h-16 items-center justify-center border-b">
            <Button variant="ghost" size="icon" className="h-12 w-12">
              <Bell className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex h-16 items-center justify-center border-b">
            <UserProfile />
          </div>
        </div>
      </div>
    </ProtectedContent>
  );
} 