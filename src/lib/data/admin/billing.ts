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

