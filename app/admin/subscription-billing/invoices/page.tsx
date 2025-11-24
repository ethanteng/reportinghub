'use client';

// Legacy: "Manage Billing" > "Billing History" tab → New: Subscription & Billing > Invoices & History

import { SectionTabs } from '@/components/admin/SectionTabs';
import { InvoiceHistory } from '@/components/admin/InvoiceHistory';
import { invoices } from '@/lib/data/admin/billing';

const tabs = [
  { name: 'Overview', href: '/admin/subscription-billing' },
  { name: 'Plans & Add-Ons', href: '/admin/subscription-billing/plans' },
  { name: 'Payment Methods', href: '/admin/subscription-billing/payment-methods' },
  { name: 'Invoices & History', href: '/admin/subscription-billing/invoices' },
  { name: 'Usage', href: '/admin/subscription-billing/usage' },
];

export default function InvoicesHistoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Subscription & Billing</h2>
        <p className="text-muted-foreground">
          View and download billing invoices and payment history
        </p>
      </div>

      <SectionTabs tabs={tabs} basePath="/admin/subscription-billing" />

      <InvoiceHistory invoices={invoices} />
    </div>
  );
}

