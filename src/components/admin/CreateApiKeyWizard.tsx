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
import { ScopeSelector } from './ScopeSelector';
import { TokenDisplayDialog } from './TokenDisplayDialog';
import { Scope } from '@/types/apiKeys';
import { generateMockToken } from '@/lib/data/admin/apiKeys';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CreateApiKeyWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (key: { name: string; expiration: string; scopes: Scope[]; token: string }) => void;
}

export function CreateApiKeyWizard({ open, onOpenChange, onComplete }: CreateApiKeyWizardProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [expiration, setExpiration] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<Scope[]>([]);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [showTokenDialog, setShowTokenDialog] = useState(false);

  // Set default expiration to 90 days from now
  const getDefaultExpiration = () => {
    const date = new Date();
    date.setDate(date.getDate() + 90);
    return date.toISOString().split('T')[0];
  };

  // Initialize expiration when dialog opens
  useEffect(() => {
    if (open && !expiration) {
      setExpiration(getDefaultExpiration());
    }
  }, [open, expiration]);

  const handleStep1Next = () => {
    if (!name.trim()) {
      return;
    }
    setStep(2);
  };

  const handleStep2Next = () => {
    if (selectedScopes.length === 0) {
      return;
    }
    // Generate token
    const token = generateMockToken();
    setGeneratedToken(token);
    setStep(3);
  };

  const handleStep3Complete = () => {
    if (!generatedToken) return;

    onComplete({
      name: name.trim(),
      expiration: new Date(expiration).toISOString(),
      scopes: selectedScopes,
      token: generatedToken,
    });

    // Reset wizard state
    setName('');
    setExpiration(getDefaultExpiration());
    setSelectedScopes([]);
    setGeneratedToken(null);
    setStep(1);
    setShowTokenDialog(true);
  };

  const handleClose = () => {
    if (step === 3 && generatedToken) {
      // If on step 3, show token dialog instead of closing
      handleStep3Complete();
      return;
    }
    // Reset wizard state
    setName('');
    setExpiration(getDefaultExpiration());
    setSelectedScopes([]);
    setGeneratedToken(null);
    setStep(1);
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
            <DialogTitle>
              Create API Key {step > 1 && `(${step} of 3)`}
            </DialogTitle>
            <DialogDescription>
              {step === 1 && 'Give your API key a name and set when it expires.'}
              {step === 2 && 'Select the permissions this API key will have.'}
              {step === 3 && 'Your API key has been generated. Copy it now - you won\'t be able to see it again.'}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {/* Step 1: Name + Expiry */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="key-name">Key Name</Label>
                  <Input
                    id="key-name"
                    placeholder="e.g., Production API Key"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                  />
                  <p className="text-sm text-muted-foreground">
                    Choose a descriptive name to identify this key later.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiration">Expiration Date</Label>
                  <Input
                    id="expiration"
                    type="date"
                    value={expiration}
                    onChange={(e) => setExpiration(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <p className="text-sm text-muted-foreground">
                    The API key will automatically expire on this date. Default is 90 days from today.
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Select Scopes */}
            {step === 2 && (
              <ScopeSelector
                selectedScopes={selectedScopes}
                onScopesChange={setSelectedScopes}
              />
            )}

            {/* Step 3: Generate Token */}
            {step === 3 && generatedToken && (
              <div className="space-y-4">
                <div className="rounded-md bg-muted p-4">
                  <Label className="text-sm font-medium mb-2 block">API Key Token</Label>
                  <div className="font-mono text-sm break-all bg-background p-3 rounded border">
                    {generatedToken}
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">
                    ⚠️ This token will only be shown once. Make sure to copy it to a secure location before closing this dialog.
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <div className="flex justify-between w-full">
              {step > 1 && (
                <Button variant="outline" onClick={() => setStep(step - 1)}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              )}
              <div className="flex gap-2 ml-auto">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                {step < 3 && (
                  <Button onClick={step === 1 ? handleStep1Next : handleStep2Next}>
                    Continue
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
                {step === 3 && (
                  <Button onClick={handleStep3Complete}>
                    Done
                  </Button>
                )}
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {generatedToken && (
        <TokenDisplayDialog
          open={showTokenDialog}
          onOpenChange={setShowTokenDialog}
          token={generatedToken}
          keyName={name}
        />
      )}
    </>
  );
}
