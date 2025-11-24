'use client';

// Legacy: "Azure Service Metrics" → New: Integrations & System > Azure Metrics

import { SectionTabs } from '@/components/admin/SectionTabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/admin/FormField';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const tabs = [
  { name: 'Authentication', href: '/admin/integrations-system/auth' },
  { name: 'Email & SMTP', href: '/admin/integrations-system/smtp' },
  { name: 'Power BI', href: '/admin/integrations-system/powerbi' },
  { name: 'Webhooks', href: '/admin/integrations-system/webhooks' },
  { name: 'App Settings', href: '/admin/integrations-system/app-settings' },
  { name: 'Azure Metrics', href: '/admin/integrations-system/metrics' },
];

export default function AzureMetricsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Integrations & System</h2>
        <p className="text-muted-foreground">
          View Azure service metrics and performance data
        </p>
      </div>

      <SectionTabs tabs={tabs} basePath="/admin/integrations-system" />

      <Card>
        <CardHeader>
          <CardTitle>Azure Service Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <FormField label="Select Control">
              <Select disabled>
                <SelectTrigger>
                  <SelectValue placeholder="Select One..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cpu">CPU Usage</SelectItem>
                  <SelectItem value="memory">Memory Usage</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Select Measure">
              <Select disabled>
                <SelectTrigger>
                  <SelectValue placeholder="Select One..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="avg">Average</SelectItem>
                  <SelectItem value="max">Maximum</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Aggregation">
              <Select defaultValue="average" disabled>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="average">Average</SelectItem>
                  <SelectItem value="sum">Sum</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Date Start">
              <Input value="11/17/2025, 04:3" disabled />
            </FormField>
            <FormField label="Date End">
              <Input value="11/24/2025, 04:..." disabled />
            </FormField>
          </div>
          <div className="flex items-center justify-between">
            <FormField label="Select Chart">
              <Select defaultValue="line" disabled>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">Line</SelectItem>
                  <SelectItem value="bar">Bar</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <Button disabled>Refresh Chart</Button>
          </div>
          <div className="h-64 border rounded-lg flex items-center justify-center bg-muted/20">
            <p className="text-muted-foreground">Chart visualization would appear here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

