import { ApiKey } from '@/types/apiKeys';

// Helper to generate timestamps
const now = new Date();
const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
const hoursAgo = (hours: number) => new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();
const daysFromNow = (days: number) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();

export const mockApiKeys: ApiKey[] = [
  {
    id: 'key_1',
    name: 'Production API Key',
    scopes: ['reports.read', 'data.read'],
    expiration: daysFromNow(30),
    lastUsed: hoursAgo(2),
    status: 'Active',
    createdAt: daysAgo(90),
    token: 'rh_live_abc123def456ghi789jkl012mno345pqr678stu901vwx234yz',
  },
  {
    id: 'key_2',
    name: 'Development Key',
    scopes: ['reports.read', 'reports.write', 'data.read'],
    expiration: daysFromNow(60),
    lastUsed: hoursAgo(12),
    status: 'Active',
    createdAt: daysAgo(7),
    token: 'rh_live_dev789xyz123abc456def789ghi012jkl345mno678pqr901',
  },
  {
    id: 'key_3',
    name: 'Analytics Dashboard',
    scopes: ['reports.read'],
    expiration: daysFromNow(15),
    lastUsed: hoursAgo(1),
    status: 'Active',
    createdAt: daysAgo(30),
    token: 'rh_live_analytics456xyz789abc123def456ghi789jkl012mno345',
  },
  {
    id: 'key_4',
    name: 'Admin Integration',
    scopes: ['admin', 'users.read'],
    expiration: daysFromNow(90),
    lastUsed: null,
    status: 'Active',
    createdAt: daysAgo(14),
    token: 'rh_live_admin123xyz456abc789def012ghi345jkl678mno901pqr',
  },
  {
    id: 'key_5',
    name: 'Legacy Production Key',
    scopes: ['reports.read', 'data.read'],
    expiration: daysFromNow(45),
    lastUsed: daysAgo(5),
    status: 'Rotated',
    createdAt: daysAgo(120),
    rotatedAt: daysAgo(7),
    token: 'rh_live_legacy789abc123def456ghi789jkl012mno345pqr678stu',
  },
  {
    id: 'key_6',
    name: 'Test Key',
    scopes: ['reports.write'],
    expiration: daysAgo(10), // Expired
    lastUsed: daysAgo(20),
    status: 'Revoked',
    createdAt: daysAgo(60),
    revokedAt: daysAgo(15),
    token: 'rh_live_test456xyz789abc123def456ghi789jkl012mno345pqr',
  },
];

// Helper function to generate a new mock API key token
export function generateMockToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const prefix = 'rh_live_';
  const length = 48;
  let token = prefix;
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}
