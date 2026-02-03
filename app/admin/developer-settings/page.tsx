'use client';

import { useState, useEffect } from 'react';
import { SectionTabs } from '@/components/admin/SectionTabs';
import { ApiKeyTable } from '@/components/admin/ApiKeyTable';
import { CreateApiKeyWizard } from '@/components/admin/CreateApiKeyWizard';
import { DeveloperSetupWizard } from '@/components/admin/DeveloperSetupWizard';
import { SetupWizardBanner } from '@/components/admin/SetupWizardBanner';
import { Button } from '@/components/ui/button';
import { Plus, Rocket } from 'lucide-react';
import { ApiKey, Scope, OAuthApp } from '@/types/apiKeys';
import { mockApiKeys, generateMockToken } from '@/lib/data/admin/apiKeys';
import { shouldShowWizard } from '@/lib/utils/wizardStorage';
import { addStoredOAuthApp } from '@/lib/utils/oauthAppsStorage';

const tabs = [
  { name: 'API Keys', href: '/admin/developer-settings' },
  { name: 'OAuth / SSO Applications', href: '/admin/developer-settings/oauth-apps' },
  { name: 'Token Security', href: '/admin/developer-settings/token-security' },
];

export default function DeveloperSettingsPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(mockApiKeys);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isSetupWizardOpen, setIsSetupWizardOpen] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  // Check if banner should be shown on mount
  useEffect(() => {
    setShowBanner(shouldShowWizard());
    // Auto-open wizard if banner should show (first visit)
    if (shouldShowWizard()) {
      setIsSetupWizardOpen(true);
    }
  }, []);

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

  const handleSetupWizardApiKeyCreated = (key: ApiKey) => {
    setApiKeys([key, ...apiKeys]);
    setShowBanner(false); // Hide banner after first API key is created
  };

  const handleSetupWizardOAuthAppCreated = (app: {
    name: string;
    redirectUris: string[];
    clientId: string;
    clientSecret: string;
  }) => {
    const newApp: OAuthApp = {
      id: `oauth_${Date.now()}`,
      name: app.name,
      clientId: app.clientId,
      clientSecret: app.clientSecret,
      status: 'Active',
      createdAt: new Date().toISOString(),
      lastUsed: null,
      redirectUris: app.redirectUris,
    };
    // Persist to localStorage so it shows up in the OAuth apps page
    addStoredOAuthApp(newApp);
    setShowBanner(false);
  };

  const handleLaunchSetupWizard = () => {
    setIsSetupWizardOpen(true);
  };

  const handleSetupWizardClose = (open: boolean) => {
    setIsSetupWizardOpen(open);
    // Update banner visibility when wizard closes
    if (!open) {
      setShowBanner(shouldShowWizard());
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Developer Settings</h2>
          <p className="text-muted-foreground">
            Manage API keys, OAuth applications, and token security settings for machine-to-machine access.
          </p>
        </div>
        <Button variant="outline" onClick={handleLaunchSetupWizard}>
          <Rocket className="mr-2 h-4 w-4" />
          Setup Wizard
        </Button>
      </div>

      <SectionTabs tabs={tabs} basePath="/admin/developer-settings" />

      {/* Setup Wizard Banner */}
      {showBanner && (
        <SetupWizardBanner
          onLaunchWizard={handleLaunchSetupWizard}
          onDismiss={() => setShowBanner(false)}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">API Keys</h3>
          <p className="text-sm text-muted-foreground">
            Generate and manage API keys for programmatic access to your resources.
          </p>
        </div>
        <div className="flex gap-2">
          {showBanner && (
            <Button variant="outline" onClick={handleLaunchSetupWizard}>
              <Rocket className="mr-2 h-4 w-4" />
              Launch Setup Wizard
            </Button>
          )}
          <Button onClick={() => setIsWizardOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create API Key
          </Button>
        </div>
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

      <DeveloperSetupWizard
        open={isSetupWizardOpen}
        onOpenChange={handleSetupWizardClose}
        onApiKeyCreated={handleSetupWizardApiKeyCreated}
        onOAuthAppCreated={handleSetupWizardOAuthAppCreated}
      />
    </div>
  );
}
