'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { X, Rocket } from 'lucide-react';
import { dismissWizard } from '@/lib/utils/wizardStorage';

interface SetupWizardBannerProps {
  onLaunchWizard: () => void;
  onDismiss?: () => void;
}

export function SetupWizardBanner({ onLaunchWizard, onDismiss }: SetupWizardBannerProps) {
  const handleDismiss = () => {
    dismissWizard();
    onDismiss?.();
  };

  return (
    <Alert className="border-primary/50 bg-primary/5">
      <Rocket className="h-4 w-4 text-primary" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1">
          <span className="font-medium">Get started with Developer Settings</span>
          <span className="text-muted-foreground ml-2">
            Set up API keys, OAuth applications, and security settings in minutes.
          </span>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <Button size="sm" onClick={onLaunchWizard}>
            Get Started
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
