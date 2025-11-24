'use client';

// Legacy: "SMTP Setup" → New: Integrations & System > Email & SMTP

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

const tabs = [
  { name: 'Authentication', href: '/admin/integrations-system/auth' },
  { name: 'Email & SMTP', href: '/admin/integrations-system/smtp' },
  { name: 'Power BI', href: '/admin/integrations-system/powerbi' },
  { name: 'Webhooks', href: '/admin/integrations-system/webhooks' },
  { name: 'App Settings', href: '/admin/integrations-system/app-settings' },
  { name: 'Azure Metrics', href: '/admin/integrations-system/metrics' },
];

// Mock SMTP configurations
const smtpConfigs = [
  {
    id: '1',
    name: 'Brevo',
    server: 'smtp-relay.brevo.com',
    from: 'renata.lamb@thereportinghub.com',
    enabled: true,
    default: false,
    provider: 'BasicSmtp',
  },
  {
    id: '2',
    name: 'MS 365',
    server: '',
    from: 'dana.luntrariu@thereportinghub.com',
    enabled: true,
    default: true,
    provider: 'Microsoft365Graph',
  },
];

export default function SMTPPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Integrations & System</h2>
        <p className="text-muted-foreground">
          Configure SMTP server details for email notifications
        </p>
      </div>

      <SectionTabs tabs={tabs} basePath="/admin/integrations-system" />

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">SMTP Servers</h3>
          <p className="text-sm text-muted-foreground">
            Manage email server configurations
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>SMTP Server Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Server Address</TableHead>
                <TableHead>From Address</TableHead>
                <TableHead>Enabled</TableHead>
                <TableHead>Default Server</TableHead>
                <TableHead>Email Provider</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {smtpConfigs.map((config) => (
                <TableRow key={config.id}>
                  <TableCell className="font-medium">{config.name}</TableCell>
                  <TableCell>{config.server || '-'}</TableCell>
                  <TableCell>{config.from}</TableCell>
                  <TableCell>
                    {config.enabled ? (
                      <StatusBadge status="Active" />
                    ) : (
                      <StatusBadge status="Inactive" />
                    )}
                  </TableCell>
                  <TableCell>
                    {config.default ? (
                      <StatusBadge status="Active" />
                    ) : (
                      <span className="text-muted-foreground">No</span>
                    )}
                  </TableCell>
                  <TableCell>{config.provider}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
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

