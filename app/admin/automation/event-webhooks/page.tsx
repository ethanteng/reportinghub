'use client';

// Legacy: "Scheduled Tasks Admin" > "Event Webhooks" → New: Automation > Event Webhooks

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
  { name: 'Scheduled Tasks', href: '/admin/automation/tasks' },
  { name: 'Notifications', href: '/admin/automation/notifications' },
  { name: 'Event Webhooks', href: '/admin/automation/event-webhooks' },
];

// Mock event webhooks
const eventWebhooks = [
  {
    id: '1',
    eventName: 'Report Published',
    url: 'https://example.com/webhook/report-published',
    status: 'Active',
    lastRun: '2025-11-23T14:30:00Z',
  },
  {
    id: '2',
    eventName: 'User Invited',
    url: 'https://example.com/webhook/user-invited',
    status: 'Active',
    lastRun: '2025-11-23T12:15:00Z',
  },
];

export default function EventWebhooksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Automation</h2>
        <p className="text-muted-foreground">
          Configure event webhooks for automated workflows
        </p>
      </div>

      <SectionTabs tabs={tabs} basePath="/admin/automation" />

      <div className="flex items-center justify-between">
        <Input placeholder="Search webhooks..." className="max-w-sm" />
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Event Webhook
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
                <TableHead>Webhook URL</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Run</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {eventWebhooks.map((webhook) => (
                <TableRow key={webhook.id}>
                  <TableCell className="font-medium">{webhook.eventName}</TableCell>
                  <TableCell className="font-mono text-xs">{webhook.url}</TableCell>
                  <TableCell>
                    <StatusBadge status={webhook.status as 'Connected'} />
                  </TableCell>
                  <TableCell>
                    {new Date(webhook.lastRun).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" disabled>
                        Test
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

