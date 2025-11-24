'use client';

// Legacy: "Scheduled Tasks Admin" → New: Automation > Scheduled Tasks
// Legacy: "Notifications" → New: Automation > Notifications
// Legacy: "Event Webhooks" (from Scheduled Tasks) → New: Automation > Event Webhooks

import { SectionTabs } from '@/components/admin/SectionTabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const tabs = [
  { name: 'Scheduled Tasks', href: '/admin/automation/tasks' },
  { name: 'Notifications', href: '/admin/automation/notifications' },
  { name: 'Event Webhooks', href: '/admin/automation/event-webhooks' },
];

export default function AutomationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Automation</h2>
        <p className="text-muted-foreground">
          Manage scheduled tasks, notifications, and automated workflows. Use this area to configure 
          email tasks, event webhooks, and notification preferences.
        </p>
      </div>

      <SectionTabs tabs={tabs} basePath="/admin/automation" />

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Scheduled Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Configure automated email tasks and scheduled reports
            </p>
            <p className="text-2xl font-bold">12</p>
            <p className="text-xs text-muted-foreground">Active tasks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Manage notification preferences and channels
            </p>
            <p className="text-2xl font-bold">3</p>
            <p className="text-xs text-muted-foreground">Channels configured</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Event Webhooks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Configure webhook endpoints for events
            </p>
            <p className="text-2xl font-bold">8</p>
            <p className="text-xs text-muted-foreground">Webhooks active</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

