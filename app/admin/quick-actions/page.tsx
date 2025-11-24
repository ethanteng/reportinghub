'use client';

import { QuickActionCard } from '@/components/admin/QuickActionCard';
import {
  Building2,
  UserPlus,
  UserCog,
  CreditCard,
  Shield,
  Mail,
  FileText,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function QuickActionsPage() {
  const router = useRouter();

  const actions = [
    {
      title: 'Add New Tenant',
      description: 'Create a new tenant and configure its settings',
      icon: Building2,
      onAction: () => {
        toast.info('Add Tenant modal would open here');
      },
    },
    {
      title: 'Invite a User',
      description: 'Send an invitation to a new user to join the platform',
      icon: UserPlus,
      onAction: () => {
        toast.info('Invite User modal would open here');
      },
    },
    {
      title: "Change a User's Role",
      description: 'Update user roles and permissions across tenants',
      icon: UserCog,
      onAction: () => {
        router.push('/admin/seats-roles');
      },
    },
    {
      title: 'Update Plan / Seats',
      description: 'Modify subscription plan or adjust seat allocations',
      icon: CreditCard,
      onAction: () => {
        router.push('/admin/billing');
      },
    },
    {
      title: 'Configure Authentication',
      description: 'Set up Azure AD, SSO, or API key authentication',
      icon: Shield,
      onAction: () => {
        router.push('/admin/auth-security');
      },
    },
    {
      title: 'Update SMTP Settings',
      description: 'Configure email server settings for notifications',
      icon: Mail,
      onAction: () => {
        router.push('/admin/integrations');
      },
    },
    {
      title: 'View Audit Logs',
      description: 'Review system activity and access logs',
      icon: FileText,
      onAction: () => {
        toast.info('Audit Logs viewer would open here');
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Quick Actions</h2>
        <p className="text-muted-foreground">
          Common administrative tasks and shortcuts
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {actions.map((action, idx) => (
          <QuickActionCard
            key={idx}
            title={action.title}
            description={action.description}
            icon={action.icon}
            onAction={action.onAction}
          />
        ))}
      </div>
    </div>
  );
}

