'use client';

// Legacy: "Refresh Workspaces and Capacities" action → New: Tenants & Workspaces > Workspaces

import { SectionTabs } from '@/components/admin/SectionTabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
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
  { name: 'All Tenants', href: '/admin/tenants-workspaces' },
  { name: 'Workspaces', href: '/admin/tenants-workspaces/workspaces' },
  { name: 'Organization Info', href: '/admin/tenants-workspaces/organization' },
];

// Mock workspace data
const workspaces = [
  {
    id: 'ws1',
    name: 'Production Workspace',
    tenant: 'Client A – Tax',
    capacity: 'P1',
    status: 'Active',
    lastSync: '2025-11-23T14:30:00Z',
  },
  {
    id: 'ws2',
    name: 'UAT Workspace',
    tenant: 'ReportingHub UAT',
    capacity: 'F64',
    status: 'Active',
    lastSync: '2025-11-23T12:15:00Z',
  },
  {
    id: 'ws3',
    name: 'Sandbox Workspace',
    tenant: 'Internal Sandbox',
    capacity: 'F2',
    status: 'Active',
    lastSync: '2025-11-22T18:45:00Z',
  },
];

export default function WorkspacesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Tenants & Workspaces</h2>
        <p className="text-muted-foreground">
          Manage Power BI workspaces and refresh capacities across tenants
        </p>
      </div>

      <SectionTabs tabs={tabs} basePath="/admin/tenants-workspaces" />

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Workspaces</h3>
          <p className="text-sm text-muted-foreground">
            View and manage Power BI workspaces and their capacities
          </p>
        </div>
        <Button>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh All Capacities
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Workspace List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Workspace Name</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Sync</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workspaces.map((workspace) => (
                <TableRow key={workspace.id}>
                  <TableCell className="font-medium">{workspace.name}</TableCell>
                  <TableCell>{workspace.tenant}</TableCell>
                  <TableCell>{workspace.capacity}</TableCell>
                  <TableCell>
                    <StatusBadge status={workspace.status as 'Active'} />
                  </TableCell>
                  <TableCell>
                    {new Date(workspace.lastSync).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" disabled>
                      Refresh
                    </Button>
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

