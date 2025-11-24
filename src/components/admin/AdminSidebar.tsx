'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  Users,
  Plug,
  Zap,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

// Legacy UI Mapping:
// - "Tenant Admin" → Tenants & Workspaces
// - "Manage Billing" → Subscription & Billing
// - "Manage Seats" → Users & Access
// - "Auth Schemes", "App Settings" (SMTP, WebHook, etc.) → Integrations & System
// - "Scheduled Tasks", "Notifications" → Automation

const navigation = [
  { 
    name: 'Overview', 
    href: '/admin', 
    icon: LayoutDashboard,
    description: 'Dashboard and key metrics'
  },
  { 
    name: 'Tenants & Workspaces', 
    href: '/admin/tenants-workspaces', 
    icon: Building2,
    description: 'Manage tenants, workspaces, and capacities',
    subItems: [
      { name: 'All Tenants', href: '/admin/tenants-workspaces' },
      { name: 'Workspaces', href: '/admin/tenants-workspaces/workspaces' },
      { name: 'Organization Info', href: '/admin/tenants-workspaces/organization' },
    ]
  },
  { 
    name: 'Subscription & Billing', 
    href: '/admin/subscription-billing', 
    icon: CreditCard,
    description: 'Plans, add-ons, payment methods, and invoices',
    subItems: [
      { name: 'Overview', href: '/admin/subscription-billing' },
      { name: 'Plans & Add-Ons', href: '/admin/subscription-billing/plans' },
      { name: 'Payment Methods', href: '/admin/subscription-billing/payment-methods' },
      { name: 'Invoices & History', href: '/admin/subscription-billing/invoices' },
      { name: 'Usage', href: '/admin/subscription-billing/usage' },
    ]
  },
  { 
    name: 'Users & Access', 
    href: '/admin/users-access', 
    icon: Users,
    description: 'Seats, roles, permissions, and user management',
    subItems: [
      { name: 'Seats Overview', href: '/admin/users-access' },
      { name: 'Assign Seats', href: '/admin/users-access/assign-seats' },
      { name: 'Permission Sets', href: '/admin/users-access/permission-sets' },
      { name: 'User Management', href: '/admin/users-access/users' },
    ]
  },
  { 
    name: 'Integrations & System', 
    href: '/admin/integrations-system', 
    icon: Plug,
    description: 'Auth, SMTP, Power BI, webhooks, and app settings',
    subItems: [
      { name: 'Authentication', href: '/admin/integrations-system/auth' },
      { name: 'Email & SMTP', href: '/admin/integrations-system/smtp' },
      { name: 'Power BI', href: '/admin/integrations-system/powerbi' },
      { name: 'Webhooks', href: '/admin/integrations-system/webhooks' },
      { name: 'App Settings', href: '/admin/integrations-system/app-settings' },
      { name: 'Azure Metrics', href: '/admin/integrations-system/metrics' },
    ]
  },
  { 
    name: 'Automation', 
    href: '/admin/automation', 
    icon: Zap,
    description: 'Scheduled tasks, notifications, and workflows',
    subItems: [
      { name: 'Scheduled Tasks', href: '/admin/automation/tasks' },
      { name: 'Notifications', href: '/admin/automation/notifications' },
      { name: 'Event Webhooks', href: '/admin/automation/event-webhooks' },
    ]
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(() => {
    // Auto-expand the active section
    const activeItem = navigation.find(item => 
      pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
    );
    return activeItem ? [activeItem.name] : [];
  });

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev =>
      prev.includes(itemName)
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  return (
    <aside className="w-64 border-r bg-muted/40 flex flex-col">
      <div className="flex h-16 items-center border-b px-6">
        <h2 className="text-lg font-semibold">App Settings</h2>
      </div>
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          const isExpanded = expandedItems.includes(item.name);
          const Icon = item.icon;
          const hasSubItems = item.subItems && item.subItems.length > 0;
          
          return (
            <div key={item.name}>
              {hasSubItems ? (
                <button
                  onClick={() => toggleExpanded(item.name)}
                  className={cn(
                    'w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="flex-1 text-left">{item.name}</span>
                  <ChevronRight
                    className={cn(
                      'h-4 w-4 transition-transform',
                      isExpanded && 'rotate-90'
                    )}
                  />
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )}
              
              {hasSubItems && isExpanded && (
                <div className="ml-8 mt-1 space-y-1">
                  {item.subItems!.map((subItem) => {
                    const isSubActive = pathname === subItem.href || pathname.startsWith(subItem.href + '/');
                    return (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        className={cn(
                          'block rounded-lg px-3 py-1.5 text-sm transition-colors',
                          isSubActive
                            ? 'bg-background text-foreground font-medium'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                      >
                        {subItem.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

