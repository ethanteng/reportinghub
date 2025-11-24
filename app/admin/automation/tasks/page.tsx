'use client';

// Legacy: "Scheduled Tasks Admin" > "Email Tasks" → New: Automation > Scheduled Tasks

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const tabs = [
  { name: 'Scheduled Tasks', href: '/admin/automation/tasks' },
  { name: 'Notifications', href: '/admin/automation/notifications' },
  { name: 'Event Webhooks', href: '/admin/automation/event-webhooks' },
];

// Mock scheduled tasks
const emailTasks = [
  {
    id: '1',
    name: 'Import Mode Deal Optix',
    type: 'Report Email',
    triggerType: 'Date/Time',
    dateEnd: '2025-12-31 23:59',
    lastRun: '2025-11-23 08:00',
    nextRun: '2025-11-24 08:00',
    status: 'Completed',
    frequency: 'daily',
    enabled: true,
    to: 'renata.lamb@thereportinghub.com',
  },
  {
    id: '2',
    name: 'Dynamic RLS',
    type: 'Report Email',
    triggerType: 'Date/Time',
    dateEnd: '2025-12-31 23:59',
    lastRun: '2025-11-23 08:00',
    nextRun: '2025-11-24 08:00',
    status: 'Completed with Error',
    frequency: 'daily',
    enabled: true,
    to: 'thiago.maturana@thereportinghub.com',
  },
];

export default function ScheduledTasksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Automation</h2>
        <p className="text-muted-foreground">
          Manage scheduled email tasks and automated reports
        </p>
      </div>

      <SectionTabs tabs={tabs} basePath="/admin/automation" />

      <Tabs defaultValue="email" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="email">Email Tasks</TabsTrigger>
            <TabsTrigger value="reports">Scheduled Reports</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Input placeholder="Search..." className="max-w-sm" />
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </div>
        </div>

        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email Task Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Trigger Type</TableHead>
                    <TableHead>Last Run</TableHead>
                    <TableHead>Next Run</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Enabled</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {emailTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.name}</TableCell>
                      <TableCell>{task.type}</TableCell>
                      <TableCell>{task.triggerType}</TableCell>
                      <TableCell>{task.lastRun}</TableCell>
                      <TableCell>{task.nextRun}</TableCell>
                      <TableCell>
                        {task.status === 'Completed' ? (
                          <StatusBadge status="Active" />
                        ) : (
                          <StatusBadge status="Error" />
                        )}
                      </TableCell>
                      <TableCell>{task.frequency}</TableCell>
                      <TableCell>
                        {task.enabled ? (
                          <StatusBadge status="Active" />
                        ) : (
                          <StatusBadge status="Inactive" />
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{task.to}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" disabled>
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Scheduled reports configuration would be displayed here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

