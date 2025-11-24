export interface Tenant {
  id: string;
  name: string;
  environment: 'Global' | 'Production' | 'UAT';
  plan: string;
  status: 'Active' | 'Inactive';
  lastActive: string;
  users: number;
  createdAt?: string;
}

export const tenants: Tenant[] = [
  {
    id: 't1',
    name: 'ReportingHub UAT',
    environment: 'Global',
    plan: 'Commercial',
    status: 'Active',
    lastActive: '2025-10-21',
    users: 42,
    createdAt: '2024-01-15',
  },
  {
    id: 't2',
    name: 'Client A – Tax',
    environment: 'Production',
    plan: 'Pro',
    status: 'Active',
    lastActive: '2025-11-01',
    users: 18,
    createdAt: '2024-03-20',
  },
  {
    id: 't3',
    name: 'Client B – Audit',
    environment: 'Production',
    plan: 'Standard',
    status: 'Inactive',
    lastActive: '2025-07-12',
    users: 5,
    createdAt: '2024-02-10',
  },
  {
    id: 't4',
    name: 'Internal Sandbox',
    environment: 'UAT',
    plan: 'Standard',
    status: 'Active',
    lastActive: '2025-11-19',
    users: 8,
    createdAt: '2024-05-01',
  },
];

