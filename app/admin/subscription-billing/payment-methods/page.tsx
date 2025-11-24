'use client';

// Legacy: "Manage Billing" > "Payment Methods" tab → New: Subscription & Billing > Payment Methods

import { SectionTabs } from '@/components/admin/SectionTabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, CreditCard } from 'lucide-react';
import { billingSummary } from '@/lib/data/admin/billing';

const tabs = [
  { name: 'Overview', href: '/admin/subscription-billing' },
  { name: 'Plans & Add-Ons', href: '/admin/subscription-billing/plans' },
  { name: 'Payment Methods', href: '/admin/subscription-billing/payment-methods' },
  { name: 'Invoices & History', href: '/admin/subscription-billing/invoices' },
  { name: 'Usage', href: '/admin/subscription-billing/usage' },
];

export default function PaymentMethodsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Subscription & Billing</h2>
        <p className="text-muted-foreground">
          Manage payment methods for your subscription
        </p>
      </div>

      <SectionTabs tabs={tabs} basePath="/admin/subscription-billing" />

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Payment Methods</h3>
          <p className="text-sm text-muted-foreground">
            Add or update payment methods for automatic billing
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Payment Method
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Default Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              <CreditCard className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="font-medium">
                  {billingSummary.paymentMethod.brand} •••• {billingSummary.paymentMethod.last4}
                </p>
                <p className="text-sm text-muted-foreground">
                  Expires {billingSummary.paymentMethod.exp}
                </p>
              </div>
            </div>
            <Button variant="outline" disabled>Update</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

