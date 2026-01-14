'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Settings,
  Users,
  Palette,
  BarChart3,
  Cog,
  Sparkles,
  HelpCircle,
  MessageSquare,
  ArrowLeft,
} from 'lucide-react';

const sidebarNav = [
  {
    name: 'Manage Content',
    href: '/manage-content',
    icon: Settings,
  },
  {
    name: 'Manage Groups',
    href: '#',
    icon: Users,
  },
  {
    name: 'Edit Theme',
    href: '#',
    icon: Palette,
  },
  {
    name: 'Power BI Settings',
    href: '#',
    icon: BarChart3,
  },
  {
    name: 'App Settings',
    href: '#',
    icon: Cog,
  },
  {
    name: 'Genius AI Agents ...',
    href: '#',
    icon: Sparkles,
  },
  {
    name: 'Help',
    href: '#',
    icon: HelpCircle,
  },
  {
    name: 'Community',
    href: '#',
    icon: MessageSquare,
  },
  {
    name: 'Exit Settings',
    href: '/admin',
    icon: ArrowLeft,
  },
];

export default function ManageContentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/40 flex flex-col">
        <div className="flex h-16 items-center border-b px-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Admin Settings
          </h2>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {sidebarNav.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
