import { ScopeDefinition } from '@/types/apiKeys';

export const availableScopes: ScopeDefinition[] = [
  {
    id: 'reports.read',
    name: 'Read Reports',
    description: 'View and read reports, dashboards, and analytics',
  },
  {
    id: 'reports.write',
    name: 'Write Reports',
    description: 'Create, update, and delete reports and dashboards',
  },
  {
    id: 'data.read',
    name: 'Read Data',
    description: 'Access and query data sources and datasets',
  },
  {
    id: 'users.read',
    name: 'Read Users',
    description: 'View user information and permissions',
  },
  {
    id: 'admin',
    name: 'Admin Access',
    description: 'Full administrative access to all resources',
  },
];
