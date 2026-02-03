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
import { Progress } from '@/components/ui/progress';
import { IntentSelectionStep, WizardIntent } from './IntentSelectionStep';
import { TokenSecuritySummaryStep } from './TokenSecuritySummaryStep';
import { TokenSecurityCustomizeStep } from './TokenSecurityCustomizeStep';
import { ScopeSelector } from './ScopeSelector';
import { TokenDisplayDialog } from './TokenDisplayDialog';
import { OAuthAppWizard } from './OAuthAppWizard';
import { Scope, ApiKey } from '@/types/apiKeys';
import { generateMockToken } from '@/lib/data/admin/apiKeys';
import { generateMockClientId, generateMockClientSecret } from '@/lib/data/admin/oauthApps';
import { saveLastStep, markWizardCompleted, WizardStep } from '@/lib/utils/wizardStorage';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface DeveloperSetupWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApiKeyCreated?: (key: ApiKey) => void;
  onOAuthAppCreated?: (app: {
    name: string;
    redirectUris: string[];
    clientId: string;
    clientSecret: string;
  }) => void;
}

const mockIssuer = 'https://api.reportinghub.com';
const mockTTL = 3600; // seconds

export function DeveloperSetupWizard({
  open,
  onOpenChange,
  onApiKeyCreated,
  onOAuthAppCreated,
}: DeveloperSetupWizardProps) {
  // Wizard state
  const [currentStep, setCurrentStep] = useState<WizardStep>(0);
  const [selectedIntent, setSelectedIntent] = useState<WizardIntent>('api-keys'); // Default to 'api-keys'
  
  // Path A: API Keys
  const [apiKeyName, setApiKeyName] = useState('');
  const [apiKeyExpiration, setApiKeyExpiration] = useState('');
  const [apiKeyScopes, setApiKeyScopes] = useState<Scope[]>(['reports.read', 'data.read']); // Preselected
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [showTokenDialog, setShowTokenDialog] = useState(false);
  
  // Path B: Token Security
  const [tokenSecuritySettings, setTokenSecuritySettings] = useState<{
    issuer?: string;
    ttl?: number;
  }>({});
  
  // Path C: OAuth
  const [showOAuthWizard, setShowOAuthWizard] = useState(false);

  // Initialize expiration when wizard opens
  useEffect(() => {
    if (open) {
      const date = new Date();
      date.setDate(date.getDate() + 90);
      setApiKeyExpiration(date.toISOString().split('T')[0]);
    }
  }, [open]);

  // Reset state when wizard closes
  useEffect(() => {
    if (!open) {
      setCurrentStep(0);
      setSelectedIntent('api-keys'); // Reset to default
      setApiKeyName('');
      setApiKeyScopes(['reports.read', 'data.read']);
      setGeneratedToken(null);
      setShowTokenDialog(false);
      setTokenSecuritySettings({});
      setShowOAuthWizard(false);
    }
  }, [open]);

  const getDefaultExpiration = () => {
    const date = new Date();
    date.setDate(date.getDate() + 90);
    return date.toISOString().split('T')[0];
  };

  const getProgress = (): number => {
    if (currentStep === 0) return 0;
    if (currentStep === 'A1') return 25;
    if (currentStep === 'A2') return 50;
    if (currentStep === 'A3') return 75;
    if (currentStep === 'B1') return 60;
    if (currentStep === 'B2') return 80;
    if (currentStep === 'C') return 50;
    return 100;
  };

  const getStepTitle = (): string => {
    if (currentStep === 0) return 'Set up Reporting Hub for developers';
    if (currentStep === 'A1') return 'Create API Key';
    if (currentStep === 'A2') return 'API Key Generated';
    if (currentStep === 'A3') return 'Token Security';
    if (currentStep === 'B1') return 'Token Security Settings';
    if (currentStep === 'B2') return 'Customize Token Security';
    if (currentStep === 'C') return 'Create OAuth Application';
    return 'Setup Complete';
  };

  // Step 0: Intent Selection
  const handleIntentContinue = () => {
    if (selectedIntent === 'api-keys' || selectedIntent === 'unsure') {
      setCurrentStep('A1');
      saveLastStep('A1');
    } else if (selectedIntent === 'oauth') {
      setCurrentStep('C');
      setShowOAuthWizard(true);
      saveLastStep('C');
    }
  };

  // Path A: Step A1 - Create API Key
  const handleA1Next = () => {
    if (!apiKeyName.trim()) {
      toast.error('Please enter a key name');
      return;
    }
    if (apiKeyScopes.length === 0) {
      toast.error('Please select at least one scope');
      return;
    }
    
    const token = generateMockToken();
    setGeneratedToken(token);
    setCurrentStep('A2');
    saveLastStep('A2');
  };

  // Path A: Step A2 - Show Token
  const handleA2Continue = () => {
    if (!generatedToken) return;
    
    const newKey: ApiKey = {
      id: `key_${Date.now()}`,
      name: apiKeyName.trim(),
      scopes: apiKeyScopes,
      expiration: new Date(apiKeyExpiration).toISOString(),
      lastUsed: null,
      status: 'Active',
      createdAt: new Date().toISOString(),
      token: generatedToken,
    };
    
    onApiKeyCreated?.(newKey);
    // Show token dialog for one-time copy, then proceed to A3
    setShowTokenDialog(true);
  };

  // Path A: Step A3 - Optional Token Security Prompt
  const handleA3No = () => {
    markWizardCompleted();
    toast.success('Setup complete! Your API key is ready to use.');
    onOpenChange(false);
  };

  const handleA3Yes = () => {
    setCurrentStep('B1');
    saveLastStep('B1');
  };

  // Path B: Step B1 - Summary
  const handleB1KeepDefaults = () => {
    markWizardCompleted();
    toast.success('Setup complete! Using default token security settings.');
    onOpenChange(false);
  };

  const handleB1Customize = () => {
    setCurrentStep('B2');
    saveLastStep('B2');
  };

  // Path B: Step B2 - Customize
  const handleB2Save = (settings: { issuer?: string; ttl?: number }) => {
    setTokenSecuritySettings(settings);
    markWizardCompleted();
    toast.success('Token security settings customized successfully!');
    onOpenChange(false);
  };

  const handleB2Cancel = () => {
    setCurrentStep('B1');
    saveLastStep('B1');
  };

  // Path C: OAuth App Created
  const handleOAuthAppCreated = (app: {
    name: string;
    redirectUris: string[];
    clientId: string;
    clientSecret: string;
  }) => {
    onOAuthAppCreated?.(app);
    markWizardCompleted();
    toast.success('OAuth application created successfully!');
    setShowOAuthWizard(false);
    onOpenChange(false);
  };

  const handleClose = () => {
    if (currentStep === 'A2' && generatedToken && !showTokenDialog) {
      // If on token display step and token dialog not shown, show it
      handleA2Continue();
      return;
    }
    onOpenChange(false);
  };

  const handleBack = () => {
    if (currentStep === 'A1') {
      setCurrentStep(0);
      saveLastStep(0);
    } else if (currentStep === 'A2') {
      setCurrentStep('A1');
      saveLastStep('A1');
    } else if (currentStep === 'A3') {
      setCurrentStep('A2');
      saveLastStep('A2');
    } else if (currentStep === 'B2') {
      setCurrentStep('B1');
      saveLastStep('B1');
    }
  };

  const canGoBack = currentStep !== 0 && currentStep !== 'B1' && currentStep !== 'C';

  return (
    <>
      <Dialog open={open && !showTokenDialog && !showOAuthWizard} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{getStepTitle()}</DialogTitle>
            <DialogDescription>
              {currentStep === 0 && 'Choose how you want to integrate with Reporting Hub'}
              {currentStep === 'A1' && 'Give your API key a name and set when it expires'}
              {currentStep === 'A2' && 'Your API key has been generated'}
              {currentStep === 'A3' && 'Optional: Customize token security settings'}
              {currentStep === 'B1' && 'Review your token security configuration'}
              {currentStep === 'B2' && 'Adjust token security settings to meet your requirements'}
            </DialogDescription>
          </DialogHeader>

          {/* Progress Indicator */}
          {currentStep !== 0 && (
            <div className="space-y-2">
              <Progress value={getProgress()} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Step {typeof currentStep === 'number' ? currentStep + 1 : currentStep}</span>
                <span>{Math.round(getProgress())}% complete</span>
              </div>
            </div>
          )}

          <div className="py-6">
            {/* Step 0: Intent Selection */}
            {currentStep === 0 && (
              <IntentSelectionStep
                selectedIntent={selectedIntent}
                onIntentChange={setSelectedIntent}
                onContinue={handleIntentContinue}
              />
            )}

            {/* Path A: Step A1 - Create API Key */}
            {currentStep === 'A1' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="key-name">Key Name</Label>
                  <Input
                    id="key-name"
                    placeholder="e.g., Production API Key"
                    value={apiKeyName}
                    onChange={(e) => setApiKeyName(e.target.value)}
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
                    value={apiKeyExpiration}
                    onChange={(e) => setApiKeyExpiration(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <p className="text-sm text-muted-foreground">
                    The API key will automatically expire on this date. Default is 90 days from today.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Scopes (Content & Navigation)</Label>
                  <ScopeSelector
                    selectedScopes={apiKeyScopes}
                    onScopesChange={setApiKeyScopes}
                  />
                  <p className="text-sm text-muted-foreground">
                    Scopes for reading reports and data are preselected. You can adjust these if needed.
                  </p>
                </div>
              </div>
            )}

            {/* Path A: Step A2 - Show Token */}
            {currentStep === 'A2' && generatedToken && (
              <div className="space-y-4">
                <div className="rounded-md bg-muted p-4">
                  <Label className="text-sm font-medium mb-2 block">API Key Token</Label>
                  <div className="font-mono text-sm break-all bg-background p-3 rounded border">
                    {generatedToken}
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">
                    ⚠️ This token will only be shown once. Make sure to copy it to a secure location before continuing.
                  </p>
                </div>
              </div>
            )}

            {/* Path A: Step A3 - Optional Token Security */}
            {currentStep === 'A3' && (
              <div className="space-y-6 text-center">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Do you want to customize token security settings?</h3>
                  <p className="text-muted-foreground">
                    You can adjust issuer, token lifetime, and signing keys. Most users can skip this step.
                  </p>
                </div>
                <div className="flex gap-3 justify-center pt-4">
                  <Button variant="outline" onClick={handleA3No} size="lg">
                    No, finish setup
                  </Button>
                  <Button onClick={handleA3Yes} size="lg">
                    Yes, customize settings
                  </Button>
                </div>
              </div>
            )}

            {/* Path B: Step B1 - Summary */}
            {currentStep === 'B1' && (
              <TokenSecuritySummaryStep
                issuer={tokenSecuritySettings.issuer || mockIssuer}
                ttl={tokenSecuritySettings.ttl || mockTTL}
                onKeepDefaults={handleB1KeepDefaults}
                onCustomize={handleB1Customize}
              />
            )}

            {/* Path B: Step B2 - Customize */}
            {currentStep === 'B2' && (
              <TokenSecurityCustomizeStep
                defaultIssuer={mockIssuer}
                defaultTTL={mockTTL}
                onSave={handleB2Save}
                onCancel={handleB2Cancel}
              />
            )}
          </div>

          <DialogFooter>
            <div className="flex justify-between w-full">
              {canGoBack && (
                <Button variant="outline" onClick={handleBack}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              )}
              <div className="flex gap-2 ml-auto">
                <Button variant="outline" onClick={handleClose}>
                  {currentStep === 'A2' ? 'Continue' : 'Cancel'}
                </Button>
                {currentStep === 0 && (
                  <Button onClick={handleIntentContinue} disabled={!selectedIntent || selectedIntent === null}>
                    Continue
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
                {currentStep === 'A1' && (
                  <Button onClick={handleA1Next}>
                    Generate API Key
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
                {currentStep === 'A2' && (
                  <Button onClick={handleA2Continue} disabled={!generatedToken}>
                    Continue
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Token Display Dialog */}
      {generatedToken && currentStep === 'A2' && (
        <TokenDisplayDialog
          open={showTokenDialog}
          onOpenChange={(open) => {
            setShowTokenDialog(open);
            if (!open) {
              // After token dialog closes, proceed to A3 step
              setCurrentStep('A3');
              saveLastStep('A3');
            }
          }}
          token={generatedToken}
          keyName={apiKeyName}
        />
      )}

      {/* OAuth Wizard */}
      {showOAuthWizard && (
        <OAuthAppWizard
          open={showOAuthWizard}
          onOpenChange={(open) => {
            setShowOAuthWizard(open);
            if (!open) {
              onOpenChange(false);
            }
          }}
          onComplete={handleOAuthAppCreated}
        />
      )}
    </>
  );
}
