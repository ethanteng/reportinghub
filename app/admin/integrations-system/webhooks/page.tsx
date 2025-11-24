'use client';

// Legacy: "WebHook" → New: Integrations & System > Webhooks

import { SectionTabs } from '@/components/admin/SectionTabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { Input } from '@/components/ui/input';

const tabs = [
  { name: 'Authentication', href: '/admin/integrations-system/auth' },
  { name: 'Email & SMTP', href: '/admin/integrations-system/smtp' },
  { name: 'Power BI', href: '/admin/integrations-system/powerbi' },
  { name: 'Webhooks', href: '/admin/integrations-system/webhooks' },
  { name: 'App Settings', href: '/admin/integrations-system/app-settings' },
  { name: 'Azure Metrics', href: '/admin/integrations-system/metrics' },
];

// Mock webhook data
const webhooks = [
  {
    id: '1',
    eventName: 'Dana New Test Event Webhook',
    status: 'Created',
    lastRun: '2025-11-06T16:47:55.727',
    privateKey: 'eyJhbGciOiJSUzI1Nils...',
  },
  {
    id: '2',
    eventName: 'Event Webhook Task',
    status: 'Created',
    lastRun: '',
    privateKey: 'eyJhbGciOiJSUzI1Nils...',
  },
];

export default function WebhooksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Integrations & System</h2>
        <p className="text-muted-foreground">
          Configure webhook endpoints for event notifications
        </p>
      </div>

      <SectionTabs tabs={tabs} basePath="/admin/integrations-system" />

      <div className="flex items-center justify-between">
        <Input placeholder="Search webhooks..." className="max-w-sm" />
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Item
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Webhooks</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Run</TableHead>
                <TableHead>Private Key</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {webhooks.map((webhook) => (
                <TableRow key={webhook.id}>
                  <TableCell className="font-medium">{webhook.eventName}</TableCell>
                  <TableCell>
                    <StatusBadge status={webhook.status as 'Connected'} />
                  </TableCell>
                  <TableCell>
                    {webhook.lastRun ? new Date(webhook.lastRun).toLocaleString() : '-'}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{webhook.privateKey}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" disabled>
                        Copy
                      </Button>
                      <Button variant="ghost" size="sm" disabled>
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" disabled>
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

