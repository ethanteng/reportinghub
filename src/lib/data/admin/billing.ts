export interface BillingSummary {
  plan: string;
  renewalDate: string;
  monthlyCost: number;
  seats: {
    admin: number;
    contentAdmin: number;
    viewer: number;
    platform?: number;
  };
  addons: string[];
  paymentMethod: {
    brand: string;
    last4: string;
    exp: string;
  };
}

export interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'Paid' | 'Failed' | 'Upcoming';
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration?: string;
}

export interface PurchasedService {
  id: string;
  serviceId: string;
  startDate: string;
  expiresOn: string | null;
  licenseType: string;
  subscriptionType: string;
  paymentTerm: string;
  totalPayment: number;
}

export const billingSummary: BillingSummary = {
  plan: 'Commercial',
  renewalDate: '2025-12-01',
  monthlyCost: 1299,
  seats: {
    admin: 5,
    contentAdmin: 10,
    viewer: 100,
    platform: 2,
  },
  addons: [
    'Azure B2C Authentication',
    'Storage Manager',
    'Embed External App',
  ],
  paymentMethod: {
    brand: 'Visa',
    last4: '4242',
    exp: '12/27',
  },
};

export const invoices: Invoice[] = [
  { id: 'inv_1', date: '2025-10-01', amount: 1299, status: 'Paid' },
  { id: 'inv_2', date: '2025-09-01', amount: 1299, status: 'Paid' },
  { id: 'inv_3', date: '2025-08-01', amount: 1299, status: 'Paid' },
  { id: 'inv_4', date: '2025-12-01', amount: 1299, status: 'Upcoming' },
];

export const services: Service[] = [
  {
    id: 'svc_1',
    name: 'Professional Services - 2 hour block',
    price: 500.00,
  },
  {
    id: 'svc_2',
    name: 'Professional Services - 4 hour block',
    price: 800.00,
  },
  {
    id: 'svc_3',
    name: 'Professional Services - 8 hour block',
    price: 1600.00,
  },
  {
    id: 'svc_4',
    name: 'Guided Pilot Program',
    price: 4500.00,
  },
];

export const purchasedServices: PurchasedService[] = [
  {
    id: 'psvc_1',
    serviceId: 'svc_3',
    startDate: '2025-09-10',
    expiresOn: null,
    licenseType: 'Professional Services - 8 hour block',
    subscriptionType: 'Service',
    paymentTerm: 'One Time',
    totalPayment: 0.00,
  },
];






