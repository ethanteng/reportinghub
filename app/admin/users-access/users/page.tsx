'use client';

// Legacy: "User Management" → New: Users & Access > User Management

import { SectionTabs } from '@/components/admin/SectionTabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { getUsersForTenant } from '@/lib/data/admin/users';
import { tenants } from '@/lib/data/admin/tenants';

const tabs = [
  { name: 'Seats Overview', href: '/admin/users-access' },
  { name: 'Assign Seats', href: '/admin/users-access/assign-seats' },
  { name: 'Permission Sets', href: '/admin/users-access/permission-sets' },
  { name: 'User Management', href: '/admin/users-access/users' },
];

export default function UserManagementPage() {
  // Aggregate users from all tenants
  const allUsers = tenants.flatMap(tenant => 
    getUsersForTenant(tenant.id).map(user => ({
      ...user,
      tenant: tenant.name,
    }))
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Users & Access</h2>
        <p className="text-muted-foreground">
          Manage users across all tenants and their access levels
        </p>
      </div>

      <SectionTabs tabs={tabs} basePath="/admin/users-access" />

      <div className="flex items-center justify-between">
        <Input placeholder="Search users..." className="max-w-sm" />
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{(user as any).tenant}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <StatusBadge status={user.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" disabled>
                      Manage
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

