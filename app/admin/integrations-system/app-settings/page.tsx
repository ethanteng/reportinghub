'use client';

// Legacy: "Global Configuration" → New: Integrations & System > App Settings
// Legacy: "Application Information" → Mapped here
// Legacy: "Language Tags Administration" → Mapped here (tertiary)

import { SectionTabs } from '@/components/admin/SectionTabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/admin/FormField';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const tabs = [
  { name: 'Authentication', href: '/admin/integrations-system/auth' },
  { name: 'Email & SMTP', href: '/admin/integrations-system/smtp' },
  { name: 'Power BI', href: '/admin/integrations-system/powerbi' },
  { name: 'Webhooks', href: '/admin/integrations-system/webhooks' },
  { name: 'App Settings', href: '/admin/integrations-system/app-settings' },
  { name: 'Azure Metrics', href: '/admin/integrations-system/metrics' },
];

export default function AppSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Integrations & System</h2>
        <p className="text-muted-foreground">
          Configure global application settings and preferences
        </p>
      </div>

      <SectionTabs tabs={tabs} basePath="/admin/integrations-system" />

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General Settings</TabsTrigger>
          <TabsTrigger value="application">Application Info</TabsTrigger>
          <TabsTrigger value="language">Language Tags</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security & Timeout</CardTitle>
              <CardDescription>
                Configure how long users stay signed in and security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField label="Idle Logout Time" description="Automatically log out users after inactive minutes (1–480 minutes)">
                <Input type="number" value="480" disabled className="w-32" />
                <span className="ml-2 text-sm text-muted-foreground">minutes</span>
              </FormField>
              <FormField label="Scheduled email task termination" description="Terminate attempting to deliver unsuccessful scheduled emails after X hours">
                <Input type="number" value="3" disabled className="w-32" />
                <span className="ml-2 text-sm text-muted-foreground">hours</span>
              </FormField>
              <FormField label="Audit Access Log Retention" description="Delete access logs after X days">
                <Input type="number" value="100" disabled className="w-32" />
                <span className="ml-2 text-sm text-muted-foreground">days</span>
              </FormField>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Cross-site cookies</Label>
                  <p className="text-sm text-muted-foreground">
                    Determines whether cross-site cookies are allowed
                  </p>
                </div>
                <Switch defaultChecked disabled />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Storage Account Integration</CardTitle>
              <CardDescription>
                Connect your Azure Storage account and container
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField label="Storage Account Name" description="Specify the Azure Storage Account name">
                <Input value="trhstorageaccount" disabled />
              </FormField>
              <FormField label="Storage Container Name" description="Specify the container name">
                <Input value="demo" disabled />
              </FormField>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="application" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Application Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField label="Version Installed" description="Current application version">
                <Input value="7.1.4.0" disabled />
              </FormField>
              <FormField label="Current Version Release Date" description="Release date of current version">
                <Input value="November 2025" disabled />
              </FormField>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Service Principal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField label="Client ID" description="Azure AD application client ID">
                <Input value="3945f92e-b5ee-4daf-a4ac-33daff3a2972" disabled />
              </FormField>
              <FormField label="Name" description="Service principal name">
                <Input value="ReportingHubApplication_UAT" disabled />
              </FormField>
              <FormField label="Object ID" description="Azure AD object ID">
                <Input value="a921f64e-00ce-419e-ae26-bdabdb16fe4e" disabled />
              </FormField>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="language" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Language Tags</CardTitle>
              <CardDescription>
                Manage language translations and tags
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Language tag management interface would be displayed here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button disabled>Save Changes</Button>
      </div>
    </div>
  );
}

