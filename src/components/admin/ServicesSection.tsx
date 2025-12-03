'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Service, PurchasedService } from '@/lib/data/admin/billing';
import { ChevronDown, ChevronUp, Download } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface ServicesSectionProps {
  services: Service[];
  purchasedServices: PurchasedService[];
}

export function ServicesSection({ services, purchasedServices }: ServicesSectionProps) {
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
  const [showCoupon, setShowCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const toggleService = (serviceId: string) => {
    const newSelected = new Set(selectedServices);
    if (newSelected.has(serviceId)) {
      newSelected.delete(serviceId);
    } else {
      newSelected.add(serviceId);
    }
    setSelectedServices(newSelected);
  };

  const calculateTotal = () => {
    return Array.from(selectedServices).reduce((total, serviceId) => {
      const service = services.find((s) => s.id === serviceId);
      return total + (service?.price || 0);
    }, 0);
  };

  const handlePlaceOrder = () => {
    if (!agreedToTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }
    if (selectedServices.size === 0) {
      toast.error('Please select at least one service');
      return;
    }
    toast.success('Order placed successfully!');
    // In a real app, this would submit the order
  };

  const handleViewInvoice = (service: PurchasedService) => {
    toast.success(`Viewing invoice for ${service.licenseType}...`);
    // In a real app, this would open the invoice
  };

  const getServiceName = (serviceId: string) => {
    return services.find((s) => s.id === serviceId)?.name || 'Unknown Service';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Purchase Services */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Purchase Services</CardTitle>
              <CardDescription>
                Services are one-time purchases and non-recurring
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    checked={selectedServices.has(service.id)}
                    onCheckedChange={() => toggleService(service.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={service.id}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {service.name}
                    </label>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {service.price.toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Services Total</span>
                  <span className="text-lg font-bold">
                    {calculateTotal().toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    })}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => setShowCoupon(!showCoupon)}
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  Do you have a coupon?
                  {showCoupon ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
                {showCoupon && (
                  <Input
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                )}
              </div>

              <div className="space-y-2 pt-4 border-t">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                    id="terms-checkbox"
                  />
                  <label
                    htmlFor="terms-checkbox"
                    className="text-xs text-muted-foreground cursor-pointer"
                  >
                    By checking this box, you agree to the Reporting Hub's{' '}
                    <Link href="#" className="text-primary hover:underline">
                      terms and conditions
                    </Link>
                    . See also{' '}
                    <Link href="#" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                    .
                  </label>
                </div>
              </div>

              <Button
                onClick={handlePlaceOrder}
                className="w-full"
                disabled={selectedServices.size === 0 || !agreedToTerms}
              >
                Place Order
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Existing Services Table */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Services</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>START DATE</TableHead>
                <TableHead>EXPIRES ON</TableHead>
                <TableHead>LICENSE TYPE</TableHead>
                <TableHead>SUBSCRIPTION TYPE</TableHead>
                <TableHead>PAYMENT TERM</TableHead>
                <TableHead>TOTAL PAYMENT</TableHead>
                <TableHead className="text-right">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchasedServices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No purchased services found
                  </TableCell>
                </TableRow>
              ) : (
                purchasedServices.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell>
                      {new Date(service.startDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {service.expiresOn
                        ? new Date(service.expiresOn).toLocaleDateString()
                        : '-'}
                    </TableCell>
                    <TableCell>{service.licenseType}</TableCell>
                    <TableCell>{service.subscriptionType}</TableCell>
                    <TableCell>{service.paymentTerm}</TableCell>
                    <TableCell>
                      {service.totalPayment.toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewInvoice(service)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        View Invoice
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {purchasedServices.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Show</span>
                <select className="h-8 rounded-md border border-input bg-background px-2 text-sm">
                  <option>10 per page</option>
                  <option>25 per page</option>
                  <option>50 per page</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled>
                  First
                </Button>
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  1
                </Button>
                <Button variant="outline" size="sm" disabled>
                  Next
                </Button>
                <Button variant="outline" size="sm" disabled>
                  Last
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

