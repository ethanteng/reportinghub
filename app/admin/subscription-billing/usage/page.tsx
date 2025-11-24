'use client';

// Legacy: Usage tracking from various billing screens → New: Subscription & Billing > Usage

import { SectionTabs } from '@/components/admin/SectionTabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { billingSummary } from '@/lib/data/admin/billing';

const tabs = [
  { name: 'Overview', href: '/admin/subscription-billing' },
  { name: 'Plans & Add-Ons', href: '/admin/subscription-billing/plans' },
  { name: 'Payment Methods', href: '/admin/subscription-billing/payment-methods' },
  { name: 'Invoices & History', href: '/admin/subscription-billing/invoices' },
  { name: 'Usage', href: '/admin/subscription-billing/usage' },
];

export default function UsagePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Subscription & Billing</h2>
        <p className="text-muted-foreground">
          Monitor usage and consumption across your subscription
        </p>
      </div>

      <SectionTabs tabs={tabs} basePath="/admin/subscription-billing" />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Seat Usage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Platform Admin</span>
                <span>{billingSummary.seats.admin} / Unlimited</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '20%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Content Admin</span>
                <span>{billingSummary.seats.contentAdmin} / Unlimited</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '15%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Viewer</span>
                <span>{billingSummary.seats.viewer} / Unlimited</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '10%' }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feature Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Feature usage metrics and analytics will be displayed here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

