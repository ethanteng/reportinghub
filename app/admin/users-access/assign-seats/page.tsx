'use client';

// Legacy: "Manage Seats" > "Assign Seats" button → New: Users & Access > Assign Seats

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
  { name: 'Seats Overview', href: '/admin/users-access' },
  { name: 'Assign Seats', href: '/admin/users-access/assign-seats' },
  { name: 'Permission Sets', href: '/admin/users-access/permission-sets' },
  { name: 'User Management', href: '/admin/users-access/users' },
];

// Mock admin data
const admins = [
  {
    id: '1',
    name: 'Renata Lamb',
    email: 'renata.lamb@thereportinghub.com',
    seatType: 'Platform Admin',
    permissionSet: 'Global',
    biGeniusAdmin: true,
    tenants: ['Reporting Hub UAT', 'User Management', 'Auth0 Tenant'],
  },
  {
    id: '2',
    name: 'John Doe',
    email: 'john.doe@example.com',
    seatType: 'Platform Admin',
    permissionSet: 'MG Custom',
    biGeniusAdmin: false,
    tenants: ['Client A – Tax', 'Internal Sandbox'],
  },
];

export default function AssignSeatsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Users & Access</h2>
        <p className="text-muted-foreground">
          Assign seats to administrators and configure their permissions
        </p>
      </div>

      <SectionTabs tabs={tabs} basePath="/admin/users-access" />

      <div className="flex items-center justify-between">
        <Input placeholder="Search administrators..." className="max-w-sm" />
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Admin
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Administrators</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Seat Type</TableHead>
                <TableHead>Permission Set</TableHead>
                <TableHead>BI Genius Admin</TableHead>
                <TableHead>Assigned Tenants</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{admin.name}</p>
                      <p className="text-sm text-muted-foreground">{admin.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={admin.seatType === 'Platform Admin' ? 'Active' : 'Active'} />
                  </TableCell>
                  <TableCell>{admin.permissionSet}</TableCell>
                  <TableCell>
                    {admin.biGeniusAdmin ? (
                      <StatusBadge status="Active" />
                    ) : (
                      <span className="text-muted-foreground">No</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {admin.tenants.slice(0, 2).map((tenant, idx) => (
                        <span key={idx} className="text-xs bg-muted px-2 py-1 rounded">
                          {tenant}
                        </span>
                      ))}
                      {admin.tenants.length > 2 && (
                        <span className="text-xs text-muted-foreground">
                          +{admin.tenants.length - 2} more
                        </span>
                      )}
                    </div>
                  </TableCell>
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
    </div>
  );
}

