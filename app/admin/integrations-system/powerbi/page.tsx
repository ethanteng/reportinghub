'use client';

// Legacy: "Power BI Settings" → New: Integrations & System > Power BI

import { SectionTabs } from '@/components/admin/SectionTabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/admin/FormField';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/admin/StatusBadge';

const tabs = [
  { name: 'Authentication', href: '/admin/integrations-system/auth' },
  { name: 'Email & SMTP', href: '/admin/integrations-system/smtp' },
  { name: 'Power BI', href: '/admin/integrations-system/powerbi' },
  { name: 'Webhooks', href: '/admin/integrations-system/webhooks' },
  { name: 'App Settings', href: '/admin/integrations-system/app-settings' },
  { name: 'Azure Metrics', href: '/admin/integrations-system/metrics' },
];

export default function PowerBIPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Integrations & System</h2>
        <p className="text-muted-foreground">
          Configure Power BI integration settings
        </p>
      </div>

      <SectionTabs tabs={tabs} basePath="/admin/integrations-system" />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Power BI Connection</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Connect to Power BI workspaces and datasets
              </p>
            </div>
            <StatusBadge status="Connected" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField label="Tenant ID" description="Azure AD tenant identifier for Power BI">
            <Input value="contoso.onmicrosoft.com" disabled />
          </FormField>
          <FormField label="Client ID" description="Application (client) ID">
            <Input value="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" disabled />
          </FormField>
          <FormField label="Workspace ID" description="Default Power BI workspace">
            <Input value="workspace-123" disabled />
          </FormField>
          <Button disabled>Test Connection</Button>
        </CardContent>
      </Card>
    </div>
  );
}

