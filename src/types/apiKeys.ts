export type ApiKeyStatus = 'Active' | 'Rotated' | 'Revoked';

export type Scope = 
  | 'reports.read' 
  | 'reports.write' 
  | 'data.read' 
  | 'users.read' 
  | 'admin';

export interface ApiKey {
  id: string;
  name: string;
  scopes: Scope[];
  expiration: string; // ISO date
  lastUsed: string | null; // ISO date or null
  status: ApiKeyStatus;
  createdAt: string;
  rotatedAt?: string; // If rotated
  revokedAt?: string; // If revoked
  token?: string; // Only shown once after creation
}

export interface OAuthApp {
  id: string;
  name: string;
  clientId: string;
  clientSecret?: string; // Only shown once after creation
  status: 'Active' | 'Revoked';
  createdAt: string;
  lastUsed: string | null;
  redirectUris: string[];
}

export interface ScopeDefinition {
  id: Scope;
  name: string;
  description: string;
}

export interface TokenSecurityConfig {
  rsaPublicKey: string;
  rsaPrivateKey?: string; // Never shown, only for mock
  issuer: string;
  readOnly: boolean;
  lastRotated?: string;
}
