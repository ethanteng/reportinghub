'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { tenants } from '@/lib/data/admin/tenants';
import { billingSummary } from '@/lib/data/admin/billing';
import { integrations } from '@/lib/data/admin/integrations';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { Building2, CreditCard, Plug, Users } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AdminDashboardPage() {
  const activeTenants = tenants.filter((t) => t.status === 'Active').length;
  const totalUsers = tenants.reduce((sum, t) => sum + t.users, 0);
  const connectedIntegrations = integrations.filter((i) => i.status === 'Connected').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of your ReportingHub administration
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tenants.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeTenants} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Across all tenants
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${billingSummary.monthlyCost.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {billingSummary.plan} plan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Integrations</CardTitle>
            <Plug className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connectedIntegrations}</div>
            <p className="text-xs text-muted-foreground">
              {integrations.length} total configured
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Tenants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tenants.slice(0, 3).map((tenant) => (
                <div key={tenant.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{tenant.name}</p>
                    <p className="text-xs text-muted-foreground">{tenant.environment}</p>
                  </div>
                  <StatusBadge status={tenant.status} />
                </div>
              ))}
              <Link href="/admin/tenants-workspaces">
                <Button variant="outline" className="w-full">
                  View All Tenants
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link href="/admin/quick-actions">
                <Button variant="outline" className="w-full justify-start">
                  Add New Tenant
                </Button>
              </Link>
              <Link href="/admin/quick-actions">
                <Button variant="outline" className="w-full justify-start">
                  Invite User
                </Button>
              </Link>
              <Link href="/admin/subscription-billing">
                <Button variant="outline" className="w-full justify-start">
                  Update Billing
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

