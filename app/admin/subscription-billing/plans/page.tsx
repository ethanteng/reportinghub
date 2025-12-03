'use client';

// Legacy: "Manage Billing" > "Subscriptions" tab → New: Subscription & Billing > Plans & Add-Ons
// Legacy: "Core Subscription", "Add-Ons" sections → Consolidated here

import { SectionTabs } from '@/components/admin/SectionTabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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

      <Tabs defaultValue="plans" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="addons">Add-Ons</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
        </TabsList>

        <TabsContent value="plans">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Core Subscription</CardTitle>
                  <CardDescription>Seats and tenants included in your subscription</CardDescription>
                </div>
                <Button variant="outline" disabled>Compare Plans</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="addons">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Add-Ons</CardTitle>
                  <CardDescription>Additional features and capacity</CardDescription>
                </div>
                <Button disabled>Update Add-Ons</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services">
          <ServicesSection services={services} purchasedServices={purchasedServices} />
        </TabsContent>
      </Tabs>
    </div>
  );
}






