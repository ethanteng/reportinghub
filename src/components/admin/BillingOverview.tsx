'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BillingSummary } from '@/lib/data/admin/billing';
import { CreditCard } from 'lucide-react';

interface BillingOverviewProps {
  billing: BillingSummary;
}

export function BillingOverview({ billing }: BillingOverviewProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Plan Name</label>
            <p className="text-2xl font-bold">{billing.plan}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Renewal Date</label>
            <p className="text-sm font-medium">
              {new Date(billing.renewalDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Monthly Cost</label>
            <p className="text-2xl font-bold">${billing.monthlyCost.toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Seat Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Admin Seats</span>
            <span className="text-sm font-medium">{billing.seats.admin}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Content Admin Seats</span>
            <span className="text-sm font-medium">{billing.seats.contentAdmin}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Viewer Seats</span>
            <span className="text-sm font-medium">{billing.seats.viewer}</span>
          </div>
          {billing.seats.platform && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Platform Seats</span>
              <span className="text-sm font-medium">{billing.seats.platform}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add-ons</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {billing.addons.map((addon, idx) => (
              <li key={idx} className="text-sm">
                • {addon}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">
                {billing.paymentMethod.brand} •••• {billing.paymentMethod.last4}
              </p>
              <p className="text-xs text-muted-foreground">
                Expires {billing.paymentMethod.exp}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

