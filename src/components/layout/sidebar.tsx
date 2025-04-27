'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Home,
  Settings,
  BarChart,
  Lightbulb,
  FileText,
  Smartphone,
  Presentation,
  DollarSign,
  Info,
  Mail,
} from 'lucide-react';

const navigationItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Devices', href: '/devices', icon: Smartphone },
  { name: 'Analytics', href: '/analytics', icon: BarChart },
  { name: 'Recommendations', href: '/recommendations', icon: Lightbulb },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Demo', href: '/demo', icon: Presentation },
  { name: 'Pricing', href: '/pricing', icon: DollarSign },
  { name: 'About', href: '/about', icon: Info },
  { name: 'Contact', href: '/contact', icon: Mail },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex h-14 items-center border-b px-4">
        <h1 className="text-lg font-semibold">VasenVolt</h1>
      </div>
      <nav className="flex-1 space-y-1 px-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start',
                  isActive && 'bg-muted'
                )}
              >
                <Icon className="mr-2 h-4 w-4" />
                {item.name}
              </Button>
            </Link>
          );
        })}
      </nav>
    </div>
  );
} 