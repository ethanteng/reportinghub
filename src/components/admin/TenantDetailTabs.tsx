'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from './StatusBadge';
import { Tenant } from '@/lib/data/admin/tenants';
import { User } from '@/lib/data/admin/users';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface TenantDetailTabsProps {
  tenant: Tenant;
  users: User[];
}

export function TenantDetailTabs({ tenant, users }: TenantDetailTabsProps) {
  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="users">Users</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
        <TabsTrigger value="billing">Billing Summary</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Tenant Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <p className="text-sm font-medium">{tenant.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-1">
                  <StatusBadge status={tenant.status} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Environment</label>
                <p className="text-sm font-medium">{tenant.environment}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">License Plan</label>
                <p className="text-sm font-medium">{tenant.plan}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Active</label>
                <p className="text-sm font-medium">
                  {new Date(tenant.lastActive).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">User Count</label>
                <p className="text-sm font-medium">{tenant.users}</p>
              </div>
              {tenant.createdAt && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created</label>
                  <p className="text-sm font-medium">
                    {new Date(tenant.createdAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="users" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{new Date(user.lastActive).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <StatusBadge status={user.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="settings" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Tenant Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Tenant-specific settings will be configured here. (Prototype - fields disabled)
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Tenant Name</label>
                <input
                  type="text"
                  value={tenant.name}
                  disabled
                  className="mt-1 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Environment</label>
                <input
                  type="text"
                  value={tenant.environment}
                  disabled
                  className="mt-1 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="billing" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Billing Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Plan</label>
                <p className="text-sm font-medium">{tenant.plan}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Monthly Cost</label>
                <p className="text-sm font-medium">$1,299.00</p>
              </div>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Full billing details available on the Billing page.
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

