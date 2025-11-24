'use client';

// Legacy: "Manage Seats" > "Assign Seats" → New: Users & Access > Seats Overview
// Legacy: "Manage Seats" > "Permission Sets" → Mapped to Permission Sets tab

import { SectionTabs } from '@/components/admin/SectionTabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { billingSummary } from '@/lib/data/admin/billing';

const tabs = [
  { name: 'Seats Overview', href: '/admin/users-access' },
  { name: 'Assign Seats', href: '/admin/users-access/assign-seats' },
  { name: 'Permission Sets', href: '/admin/users-access/permission-sets' },
  { name: 'User Management', href: '/admin/users-access/users' },
];

export default function UsersAccessPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Users & Access</h2>
        <p className="text-muted-foreground">
          Manage user seats, roles, and permissions. Use this area to assign seats, configure 
          permission sets, and manage user access across your organization.
        </p>
      </div>

      <SectionTabs tabs={tabs} basePath="/admin/users-access" />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Platform Admin Seats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold">{billingSummary.seats.admin} / Unlimited</div>
              <p className="text-sm text-muted-foreground">
                {billingSummary.seats.admin} assigned
              </p>
              <div className="w-full bg-muted rounded-full h-2 mt-4">
                <div className="bg-primary h-2 rounded-full" style={{ width: '20%' }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content Admin Seats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold">{billingSummary.seats.contentAdmin} / Unlimited</div>
              <p className="text-sm text-muted-foreground">
                {billingSummary.seats.contentAdmin} assigned
              </p>
              <div className="w-full bg-muted rounded-full h-2 mt-4">
                <div className="bg-primary h-2 rounded-full" style={{ width: '15%' }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

