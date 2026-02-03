'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TokenDisplayDialog } from './TokenDisplayDialog';
import { generateMockClientId, generateMockClientSecret } from '@/lib/data/admin/oauthApps';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface OAuthAppWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (app: {
    name: string;
    redirectUris: string[];
    clientId: string;
    clientSecret: string;
  }) => void;
}

export function OAuthAppWizard({ open, onOpenChange, onComplete }: OAuthAppWizardProps) {
  const [name, setName] = useState('');
  const [redirectUris, setRedirectUris] = useState('');
  const [clientId, setClientId] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [showTokenDialog, setShowTokenDialog] = useState(false);

  useEffect(() => {
    if (open) {
      setName('');
      setRedirectUris('');
      setClientId(null);
      setClientSecret(null);
    }
  }, [open]);

  const handleCreate = () => {
    if (!name.trim()) {
      return;
    }

    const uris = redirectUris
      .split('\n')
      .map((uri) => uri.trim())
      .filter((uri) => uri.length > 0);

    if (uris.length === 0) {
      return;
    }

    const id = generateMockClientId();
    const secret = generateMockClientSecret();

    setClientId(id);
    setClientSecret(secret);

    onComplete({
      name: name.trim(),
      redirectUris: uris,
      clientId: id,
      clientSecret: secret,
    });

    setShowTokenDialog(true);
  };

  const handleClose = () => {
    setName('');
    setRedirectUris('');
    setClientId(null);
    setClientSecret(null);
    onOpenChange(false);
  };

  const handleTokenDialogClose = () => {
    setShowTokenDialog(false);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open && !showTokenDialog} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create OAuth Application</DialogTitle>
            <DialogDescription>
              Create a new OAuth application for interactive login and embedded apps.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="app-name">Application Name</Label>
              <Input
                id="app-name"
                placeholder="e.g., Salesforce Integration"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
              <p className="text-sm text-muted-foreground">
                Choose a descriptive name to identify this application.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="redirect-uris">Redirect URIs</Label>
              <Textarea
                id="redirect-uris"
                placeholder="https://example.com/callback&#10;https://app.example.com/oauth/callback"
                value={redirectUris}
                onChange={(e) => setRedirectUris(e.target.value)}
                rows={4}
              />
              <p className="text-sm text-muted-foreground">
                Enter one redirect URI per line. These are the URLs where users will be redirected after authentication.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!name.trim() || !redirectUris.trim()}>
              Create Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {clientId && clientSecret && (
        <Dialog open={showTokenDialog} onOpenChange={setShowTokenDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>OAuth Application Created</DialogTitle>
              <DialogDescription>
                Your OAuth application &quot;{name}&quot; has been created. Copy the credentials now - you won&apos;t be able to see the client secret again.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  The client secret will only be shown once. Make sure to copy it to a secure location.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="client-id" className="text-sm font-medium">
                  Client ID
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="client-id"
                    value={clientId}
                    readOnly
                    className="font-mono text-sm"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      navigator.clipboard.writeText(clientId);
                      toast.success('Client ID copied');
                    }}
                    className="shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="client-secret" className="text-sm font-medium">
                  Client Secret
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="client-secret"
                    value={clientSecret}
                    readOnly
                    className="font-mono text-sm"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      navigator.clipboard.writeText(clientSecret);
                      toast.success('Client secret copied');
                    }}
                    className="shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleTokenDialogClose}>Done</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
