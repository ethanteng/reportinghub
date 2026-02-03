import { OAuthApp } from '@/types/apiKeys';

const now = new Date();
const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
const hoursAgo = (hours: number) => new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();

export const mockOAuthApps: OAuthApp[] = [
  {
    id: 'oauth_1',
    name: 'Salesforce Integration',
    clientId: 'client_abc123xyz456def789',
    status: 'Active',
    createdAt: daysAgo(45),
    lastUsed: hoursAgo(3),
    redirectUris: ['https://salesforce.com/callback', 'https://app.salesforce.com/oauth/callback'],
  },
  {
    id: 'oauth_2',
    name: 'Custom Dashboard App',
    clientId: 'client_def456ghi789jkl012',
    status: 'Active',
    createdAt: daysAgo(20),
    lastUsed: hoursAgo(24),
    redirectUris: ['https://dashboard.example.com/auth/callback'],
  },
  {
    id: 'oauth_3',
    name: 'Mobile App',
    clientId: 'client_ghi789jkl012mno345',
    status: 'Revoked',
    createdAt: daysAgo(90),
    lastUsed: daysAgo(30),
    redirectUris: ['com.example.mobileapp://oauth/callback'],
  },
];

// Helper function to generate a new mock client ID
export function generateMockClientId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const prefix = 'client_';
  const length = 18;
  let id = prefix;
  for (let i = 0; i < length; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

// Helper function to generate a new mock client secret
export function generateMockClientSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = 32;
  let secret = '';
  for (let i = 0; i < length; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
}
