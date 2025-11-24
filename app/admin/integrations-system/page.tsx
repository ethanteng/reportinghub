'use client';

// Legacy: "Auth Schemes" → New: Integrations & System > Authentication
// Legacy: "SMTP Setup" → New: Integrations & System > Email & SMTP
// Legacy: "Power BI Settings" → New: Integrations & System > Power BI
// Legacy: "WebHook" → New: Integrations & System > Webhooks
// Legacy: "App Settings" (Global Config, Application Info) → New: Integrations & System > App Settings
// Legacy: "Azure Service Metrics" → New: Integrations & System > Azure Metrics

import { SectionTabs } from '@/components/admin/SectionTabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IntegrationCard } from '@/components/admin/IntegrationCard';
import { integrations } from '@/lib/data/admin/integrations';
import { useState } from 'react';
import { Integration } from '@/lib/data/admin/integrations';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FormField } from '@/components/admin/FormField';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const tabs = [
  { name: 'Authentication', href: '/admin/integrations-system/auth' },
  { name: 'Email & SMTP', href: '/admin/integrations-system/smtp' },
  { name: 'Power BI', href: '/admin/integrations-system/powerbi' },
  { name: 'Webhooks', href: '/admin/integrations-system/webhooks' },
  { name: 'App Settings', href: '/admin/integrations-system/app-settings' },
  { name: 'Azure Metrics', href: '/admin/integrations-system/metrics' },
];

export default function IntegrationsSystemPage() {
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const handleConfigure = (integration: Integration) => {
    setSelectedIntegration(integration);
    setFormData(integration.config || {});
  };

  const handleTestConnection = () => {
    toast.success('Connection test successful!');
  };

  const handleSave = () => {
    toast.success('Integration configuration saved');
    setSelectedIntegration(null);
    setFormData({});
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Integrations & System</h2>
        <p className="text-muted-foreground">
          Configure authentication, email, Power BI, webhooks, and system settings. Use this area 
          to manage all integrations and configure application-wide settings.
        </p>
      </div>

      <SectionTabs tabs={tabs} basePath="/admin/integrations-system" />

      <div>
        <h3 className="text-xl font-semibold mb-4">Available Integrations</h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {integrations.map((integration) => (
            <IntegrationCard
              key={integration.id}
              integration={integration}
              onConfigure={handleConfigure}
            />
          ))}
        </div>
      </div>

      <Dialog open={!!selectedIntegration} onOpenChange={() => setSelectedIntegration(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configure {selectedIntegration?.name}</DialogTitle>
            <DialogDescription>
              Update integration settings and connection details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedIntegration?.id === 'powerbi' && (
              <>
                <FormField label="Tenant ID" description="Azure AD tenant identifier">
                  <Input
                    value={formData.tenantId || ''}
                    onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
                    placeholder="contoso.onmicrosoft.com"
                    disabled
                  />
                </FormField>
                <FormField label="Workspace ID" description="Power BI workspace identifier">
                  <Input
                    value={formData.workspaceId || ''}
                    onChange={(e) => setFormData({ ...formData, workspaceId: e.target.value })}
                    placeholder="workspace-123"
                    disabled
                  />
                </FormField>
              </>
            )}
            {selectedIntegration?.id === 'smtp' && (
              <>
                <FormField label="SMTP Host" description="Email server hostname">
                  <Input
                    value={formData.host || ''}
                    onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                    placeholder="smtp.example.com"
                    disabled
                  />
                </FormField>
                <FormField label="Port" description="SMTP server port">
                  <Input
                    type="number"
                    value={formData.port || ''}
                    onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                    placeholder="587"
                    disabled
                  />
                </FormField>
                <FormField label="From Address" description="Default sender email address">
                  <Input
                    type="email"
                    value={formData.from || ''}
                    onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                    placeholder="noreply@reportinghub.com"
                    disabled
                  />
                </FormField>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleTestConnection} disabled>
              Test Connection
            </Button>
            <Button onClick={handleSave} disabled>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

