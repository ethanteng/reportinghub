'use client';

// Legacy: "Tenant Admin" tab → New: Tenants & Workspaces > All Tenants
// Legacy: "Manage Content" → Mapped to tenant content management
// Legacy: "Organization Information" → Moved to Organization Info tab

import { TenantTable } from '@/components/admin/TenantTable';
import { tenants } from '@/lib/data/admin/tenants';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import { SectionTabs } from '@/components/admin/SectionTabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const tabs = [
  { name: 'All Tenants', href: '/admin/tenants-workspaces' },
  { name: 'Workspaces', href: '/admin/tenants-workspaces/workspaces' },
  { name: 'Organization Info', href: '/admin/tenants-workspaces/organization' },
];

export default function TenantsWorkspacesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Tenants & Workspaces</h2>
        <p className="text-muted-foreground">
          Manage tenants, workspaces, and organization settings. Use this area to view all tenants, 
          refresh workspace capacities, and configure organization-level information.
        </p>
      </div>

      <SectionTabs tabs={tabs} basePath="/admin/tenants-workspaces" />

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">All Tenants</h3>
          <p className="text-sm text-muted-foreground">
            View and manage all tenants in your organization
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Workspaces
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Tenant
          </Button>
        </div>
      </div>

      <TenantTable tenants={tenants} />
    </div>
  );
}

