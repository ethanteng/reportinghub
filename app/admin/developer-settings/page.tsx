'use client';

import { useState } from 'react';
import { SectionTabs } from '@/components/admin/SectionTabs';
import { ApiKeyTable } from '@/components/admin/ApiKeyTable';
import { CreateApiKeyWizard } from '@/components/admin/CreateApiKeyWizard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ApiKey, Scope } from '@/types/apiKeys';
import { mockApiKeys, generateMockToken } from '@/lib/data/admin/apiKeys';

const tabs = [
  { name: 'API Keys', href: '/admin/developer-settings' },
  { name: 'OAuth / SSO Applications', href: '/admin/developer-settings/oauth-apps' },
  { name: 'Token Security', href: '/admin/developer-settings/token-security' },
];

export default function DeveloperSettingsPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(mockApiKeys);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const handleCreateKey = (keyData: { name: string; expiration: string; scopes: Scope[]; token: string }) => {
    const newKey: ApiKey = {
      id: `key_${Date.now()}`,
      name: keyData.name,
      scopes: keyData.scopes,
      expiration: keyData.expiration,
      lastUsed: null,
      status: 'Active',
      createdAt: new Date().toISOString(),
      token: keyData.token,
    };
    setApiKeys([newKey, ...apiKeys]);
  };

  const handleRotate = (keyId: string) => {
    setApiKeys((keys) => {
      const keyToRotate = keys.find((k) => k.id === keyId && k.status === 'Active');
      if (!keyToRotate) return keys;

      // Create new active key
      const newKey: ApiKey = {
        id: `key_${Date.now()}`,
        name: keyToRotate.name,
        scopes: keyToRotate.scopes,
        expiration: keyToRotate.expiration,
        lastUsed: null,
        status: 'Active',
        createdAt: new Date().toISOString(),
        token: generateMockToken(),
      };

      // Mark old key as rotated and add new key
      return [
        newKey,
        ...keys.map((key) => {
          if (key.id === keyId) {
            return {
              ...key,
              status: 'Rotated' as const,
              rotatedAt: new Date().toISOString(),
            };
          }
          return key;
        }),
      ];
    });
  };

  const handleRevoke = (keyId: string) => {
    setApiKeys((keys) =>
      keys.map((key) => {
        if (key.id === keyId && key.status !== 'Revoked') {
          return {
            ...key,
            status: 'Revoked',
            revokedAt: new Date().toISOString(),
          };
        }
        return key;
      })
    );
  };

  const handleDelete = (keyId: string) => {
    setApiKeys((keys) => keys.filter((key) => key.id !== keyId));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Developer Settings</h2>
        <p className="text-muted-foreground">
          Manage API keys, OAuth applications, and token security settings for machine-to-machine access.
        </p>
      </div>

      <SectionTabs tabs={tabs} basePath="/admin/developer-settings" />

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">API Keys</h3>
          <p className="text-sm text-muted-foreground">
            Generate and manage API keys for programmatic access to your resources.
          </p>
        </div>
        <Button onClick={() => setIsWizardOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create API Key
        </Button>
      </div>

      <ApiKeyTable
        apiKeys={apiKeys}
        onRotate={handleRotate}
        onRevoke={handleRevoke}
        onDelete={handleDelete}
      />

      <CreateApiKeyWizard
        open={isWizardOpen}
        onOpenChange={setIsWizardOpen}
        onComplete={handleCreateKey}
      />
    </div>
  );
}
