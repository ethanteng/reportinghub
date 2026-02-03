'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Code, Shield, HelpCircle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export type WizardIntent = 'api-keys' | 'oauth' | 'unsure';

interface IntentSelectionStepProps {
  selectedIntent: WizardIntent | null;
  onIntentChange: (intent: WizardIntent) => void;
  onContinue: () => void;
}

export function IntentSelectionStep({
  selectedIntent,
  onIntentChange,
  onContinue,
}: IntentSelectionStepProps) {
  const [localIntent, setLocalIntent] = useState<WizardIntent>(
    selectedIntent || 'api-keys'
  );

  const handleIntentChange = (value: string) => {
    const intent = value as WizardIntent;
    setLocalIntent(intent);
    onIntentChange(intent);
  };

  const handleContinue = () => {
    if (localIntent) {
      onContinue();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-semibold">Set up Reporting Hub for developers</h3>
        <p className="text-muted-foreground">
          Choose how you want to integrate with Reporting Hub
        </p>
      </div>

      <RadioGroup value={localIntent} onValueChange={handleIntentChange}>
        <div className="grid gap-4">
          {/* Option 1: Use Reporting Hub APIs */}
          <Card
            className={cn(
              'cursor-pointer transition-all hover:border-primary',
              localIntent === 'api-keys' && 'border-primary bg-primary/5'
            )}
            onClick={() => handleIntentChange('api-keys')}
          >
            <CardHeader>
              <div className="flex items-start space-x-4">
                <RadioGroupItem value="api-keys" id="intent-api-keys" className="mt-1" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Code className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Use Reporting Hub APIs</CardTitle>
                  </div>
                  <CardDescription>
                    Generate API keys for programmatic access to reports, data, and analytics.
                    Perfect for building integrations, dashboards, or automated workflows.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Option 2: Embed Reporting Hub or enable SSO */}
          <Card
            className={cn(
              'cursor-pointer transition-all hover:border-primary',
              localIntent === 'oauth' && 'border-primary bg-primary/5'
            )}
            onClick={() => handleIntentChange('oauth')}
          >
            <CardHeader>
              <div className="flex items-start space-x-4">
                <RadioGroupItem value="oauth" id="intent-oauth" className="mt-1" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Embed Reporting Hub or enable SSO</CardTitle>
                  </div>
                  <CardDescription>
                    Set up OAuth applications for interactive login, embedded dashboards, or
                    single sign-on (SSO) integration with your identity provider.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Option 3: I'm not sure yet */}
          <Card
            className={cn(
              'cursor-pointer transition-all hover:border-primary',
              localIntent === 'unsure' && 'border-primary bg-primary/5'
            )}
            onClick={() => handleIntentChange('unsure')}
          >
            <CardHeader>
              <div className="flex items-start space-x-4">
                <RadioGroupItem value="unsure" id="intent-unsure" className="mt-1" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <HelpCircle className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">I&apos;m not sure yet</CardTitle>
                  </div>
                  <CardDescription>
                    Start with API keys - you can always add OAuth applications later.
                    API keys are the most common way to get started.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>
      </RadioGroup>
    </div>
  );
}
