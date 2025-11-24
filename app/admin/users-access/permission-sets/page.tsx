'use client';

// Legacy: "Manage Seats" > "Permission Sets" button → New: Users & Access > Permission Sets

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
import { Input } from '@/components/ui/input';

const tabs = [
  { name: 'Seats Overview', href: '/admin/users-access' },
  { name: 'Assign Seats', href: '/admin/users-access/assign-seats' },
  { name: 'Permission Sets', href: '/admin/users-access/permission-sets' },
  { name: 'User Management', href: '/admin/users-access/users' },
];

// Mock permission sets
const permissionSets = [
  {
    id: '1',
    name: 'MG Custom',
    access: [
      'Manage Content',
      'Manage Groups',
      'Power BI Settings',
      'Help & Community',
      'Manage Billing',
      'Tenant Admin',
      'User Management',
    ],
  },
  {
    id: '2',
    name: 'Content & User Admin',
    access: ['Manage Content', 'Manage Groups', 'User Management'],
  },
  {
    id: '3',
    name: 'Test Admin Permissions',
    access: [
      'Manage Content',
      'Manage Groups',
      'Edit Theme',
      'Power BI Settings',
      'Help & Community',
      'Manage Billing',
      'Tenant Admin',
      'Azure Metrics',
      'User Management',
    ],
  },
];

export default function PermissionSetsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Users & Access</h2>
        <p className="text-muted-foreground">
          Create and manage permission sets for role-based access control
        </p>
      </div>

      <SectionTabs tabs={tabs} basePath="/admin/users-access" />

      <div className="flex items-center justify-between">
        <Input placeholder="Search permission sets..." className="max-w-sm" />
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Permission Set
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Permission Sets</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Permission Set Name</TableHead>
                <TableHead>Access</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissionSets.map((set) => (
                <TableRow key={set.id}>
                  <TableCell className="font-medium">{set.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {set.access.map((item, idx) => (
                        <span key={idx} className="text-xs bg-muted px-2 py-1 rounded">
                          {item}
                        </span>
                      ))}
                    </div>
                  </TableCell>
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

