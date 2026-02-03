'use client';

import { useState, useEffect } from 'react';
import { SectionTabs } from '@/components/admin/SectionTabs';
import { OAuthAppsTable } from '@/components/admin/OAuthAppsTable';
import { OAuthAppWizard } from '@/components/admin/OAuthAppWizard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { OAuthApp } from '@/types/apiKeys';
import { mockOAuthApps } from '@/lib/data/admin/oauthApps';
import { getStoredOAuthApps, addStoredOAuthApp, updateStoredOAuthApp, deleteStoredOAuthApp } from '@/lib/utils/oauthAppsStorage';

const tabs = [
  { name: 'API Keys', href: '/admin/developer-settings' },
  { name: 'OAuth / SSO Applications', href: '/admin/developer-settings/oauth-apps' },
  { name: 'Token Security', href: '/admin/developer-settings/token-security' },
];

export default function OAuthAppsPage() {
  // Merge mock apps with stored apps from localStorage
  const [apps, setApps] = useState<OAuthApp[]>(() => {
    const stored = getStoredOAuthApps();
    // Combine stored apps with mock apps, avoiding duplicates by ID
    const mockIds = new Set(mockOAuthApps.map((app) => app.id));
    const storedUnique = stored.filter((app) => !mockIds.has(app.id));
    return [...storedUnique, ...mockOAuthApps];
  });
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // Sync with localStorage when it changes (e.g., from other tabs/pages)
  useEffect(() => {
    const stored = getStoredOAuthApps();
    const mockIds = new Set(mockOAuthApps.map((app) => app.id));
    const storedUnique = stored.filter((app) => !mockIds.has(app.id));
    setApps([...storedUnique, ...mockOAuthApps]);
  }, []);

  const handleCreateApp = (appData: {
    name: string;
    redirectUris: string[];
    clientId: string;
    clientSecret: string;
  }) => {
    const newApp: OAuthApp = {
      id: `oauth_${Date.now()}`,
      name: appData.name,
      clientId: appData.clientId,
      clientSecret: appData.clientSecret,
      status: 'Active',
      createdAt: new Date().toISOString(),
      lastUsed: null,
      redirectUris: appData.redirectUris,
    };
    // Persist to localStorage
    addStoredOAuthApp(newApp);
    setApps([newApp, ...apps]);
  };

  const handleRevoke = (appId: string) => {
    setApps((apps) =>
      apps.map((app) => {
        if (app.id === appId && app.status !== 'Revoked') {
          const updated = {
            ...app,
            status: 'Revoked' as const,
          };
          // Update in localStorage if it's a stored app
          const stored = getStoredOAuthApps();
          if (stored.some((a) => a.id === appId)) {
            updateStoredOAuthApp(appId, { status: 'Revoked' });
          }
          return updated;
        }
        return app;
      })
    );
  };

  const handleDelete = (appId: string) => {
    // Delete from localStorage if it's a stored app
    const stored = getStoredOAuthApps();
    if (stored.some((a) => a.id === appId)) {
      deleteStoredOAuthApp(appId);
    }
    setApps((apps) => apps.filter((app) => app.id !== appId));
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
          <h3 className="text-xl font-semibold">OAuth / SSO Applications</h3>
          <p className="text-sm text-muted-foreground">
            Create and manage OAuth applications for interactive login and embedded apps.
          </p>
        </div>
        <Button onClick={() => setIsWizardOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create OAuth App
        </Button>
      </div>

      <OAuthAppsTable apps={apps} onRevoke={handleRevoke} onDelete={handleDelete} />

      <OAuthAppWizard
        open={isWizardOpen}
        onOpenChange={setIsWizardOpen}
        onComplete={handleCreateApp}
      />
    </div>
  );
}
