'use client';

// Legacy: "Manage Billing" > "Overview" tab → New: Subscription & Billing > Overview
// Legacy: "Core Subscription", "Add-Ons" → Mapped to Plans & Add-Ons tab
// Legacy: "Payment Methods" → Mapped to Payment Methods tab
// Legacy: "Billing History" → Mapped to Invoices & History tab

import { BillingOverview } from '@/components/admin/BillingOverview';
import { billingSummary } from '@/lib/data/admin/billing';
import { SectionTabs } from '@/components/admin/SectionTabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const tabs = [
  { name: 'Overview', href: '/admin/subscription-billing' },
  { name: 'Plans & Add-Ons', href: '/admin/subscription-billing/plans' },
  { name: 'Payment Methods', href: '/admin/subscription-billing/payment-methods' },
  { name: 'Invoices & History', href: '/admin/subscription-billing/invoices' },
  { name: 'Usage', href: '/admin/subscription-billing/usage' },
];

export default function SubscriptionBillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Subscription & Billing</h2>
        <p className="text-muted-foreground">
          Manage your subscription, plans, add-ons, and payment methods. Use this area to view your 
          current plan, update subscriptions, manage payment methods, and review billing history.
        </p>
      </div>

      <SectionTabs tabs={tabs} basePath="/admin/subscription-billing" />

      <BillingOverview billing={billingSummary} />
    </div>
  );
}

