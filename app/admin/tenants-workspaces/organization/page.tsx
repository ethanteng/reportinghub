'use client';

// Legacy: "Organization Information" card → New: Tenants & Workspaces > Organization Info
// Legacy: "Application Information" → Moved to Integrations & System > App Settings

import { SectionTabs } from '@/components/admin/SectionTabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormField } from '@/components/admin/FormField';

const tabs = [
  { name: 'All Tenants', href: '/admin/tenants-workspaces' },
  { name: 'Workspaces', href: '/admin/tenants-workspaces/workspaces' },
  { name: 'Organization Info', href: '/admin/tenants-workspaces/organization' },
];

export default function OrganizationInfoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Tenants & Workspaces</h2>
        <p className="text-muted-foreground">
          Configure organization-level settings and information
        </p>
      </div>

      <SectionTabs tabs={tabs} basePath="/admin/tenants-workspaces" />

      <Card>
        <CardHeader>
          <CardTitle>Organization Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField label="Organization Display Name" description="The name displayed throughout the application">
            <Input value="ReportingHub UAT" disabled />
          </FormField>
          <FormField label="License Type" description="Your current license tier">
            <Input value="The ReportingHub Commercial Plan" disabled />
          </FormField>
          <FormField label="Default Domain" description="Primary domain for your organization">
            <Input value="thereportinghub.com" disabled />
          </FormField>
        </CardContent>
      </Card>
    </div>
  );
}

