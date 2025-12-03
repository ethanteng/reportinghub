'use client';

// Legacy: "Manage Billing" > "Subscriptions" tab → New: Subscription & Billing > Plans & Add-Ons
// Legacy: "Core Subscription", "Add-Ons" sections → Consolidated here

import { SectionTabs } from '@/components/admin/SectionTabs';
import { AccordionSection } from '@/components/admin/AccordionSection';
import { Button } from '@/components/ui/button';
import { billingSummary, services, purchasedServices } from '@/lib/data/admin/billing';
import { ServicesSection } from '@/components/admin/ServicesSection';

const tabs = [
  { name: 'Overview', href: '/admin/subscription-billing' },
  { name: 'Plans & Add-Ons', href: '/admin/subscription-billing/plans' },
  { name: 'Payment Methods', href: '/admin/subscription-billing/payment-methods' },
  { name: 'Invoices & History', href: '/admin/subscription-billing/invoices' },
  { name: 'Usage', href: '/admin/subscription-billing/usage' },
];

export default function PlansAddOnsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Subscription & Billing</h2>
        <p className="text-muted-foreground">
          Manage subscription plans and add-on features
        </p>
      </div>

      <SectionTabs tabs={tabs} basePath="/admin/subscription-billing" />

      <div className="space-y-4">
        <AccordionSection
          title="Plans"
          description="Seats and tenants included in your subscription"
          defaultOpen={true}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Core Subscription</h3>
                <p className="text-sm text-muted-foreground">Seats and tenants included in your subscription</p>
              </div>
              <Button variant="outline" disabled>Compare Plans</Button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Platform Administrator</p>
                <p className="text-2xl font-bold">{billingSummary.seats.admin} Seats</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Content Administrator</p>
                <p className="text-2xl font-bold">{billingSummary.seats.contentAdmin} Seats</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Viewer</p>
                <p className="text-2xl font-bold">{billingSummary.seats.viewer} Seats</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground">Plan</p>
                <p className="text-lg font-semibold">{billingSummary.plan}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Monthly Cost</p>
                <p className="text-2xl font-bold">${billingSummary.monthlyCost.toLocaleString()}</p>
              </div>
              <Button disabled>Update Subscription</Button>
            </div>
          </div>
        </AccordionSection>

        <AccordionSection
          title="Add-Ons"
          description="Additional features and capacity"
          defaultOpen={false}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Add-Ons</h3>
                <p className="text-sm text-muted-foreground">Additional features and capacity</p>
              </div>
              <Button disabled>Update Add-Ons</Button>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Features</h4>
              <ul className="space-y-2">
                {billingSummary.addons.map((addon, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <span className="text-green-600">✓</span>
                    {addon}
                  </li>
                ))}
              </ul>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">Add-on Total</p>
              <p className="text-xl font-semibold">$0.00 / month</p>
            </div>
          </div>
        </AccordionSection>

        <AccordionSection
          title="Services"
          description="One-time purchases and non-recurring services"
          defaultOpen={false}
        >
          <ServicesSection services={services} purchasedServices={purchasedServices} />
        </AccordionSection>
      </div>
    </div>
  );
}






