'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RotateCw, Upload, Save } from 'lucide-react';
import { UploadCustomKeysDialog } from './UploadCustomKeysDialog';
import { toast } from 'sonner';

interface TokenSecurityCustomizeStepProps {
  defaultIssuer: string;
  defaultTTL: number;
  onSave: (settings: { issuer?: string; ttl?: number }) => void;
  onCancel: () => void;
}

export function TokenSecurityCustomizeStep({
  defaultIssuer,
  defaultTTL,
  onSave,
  onCancel,
}: TokenSecurityCustomizeStepProps) {
  const [customIssuer, setCustomIssuer] = useState('');
  const [customTTL, setCustomTTL] = useState(defaultTTL.toString());
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  const handleRotateKeys = () => {
    toast.success('Signing keys rotated successfully');
  };

  const handleUploadKeys = () => {
    setIsUploadDialogOpen(true);
  };

  const handleKeysUploaded = (publicKey: string, privateKey: string) => {
    // Mock: In a real app, this would save the keys
    console.log('Keys uploaded:', { publicKey: publicKey.substring(0, 50) + '...', privateKey: '***hidden***' });
    setIsUploadDialogOpen(false);
    toast.success('Custom keys uploaded successfully');
  };

  const handleSave = () => {
    const settings: { issuer?: string; ttl?: number } = {};
    
    if (customIssuer.trim() && customIssuer !== defaultIssuer) {
      // Validate URL
      try {
        new URL(customIssuer);
        settings.issuer = customIssuer.trim();
      } catch {
        toast.error('Please enter a valid URL for the issuer');
        return;
      }
    }

    const ttlValue = parseInt(customTTL, 10);
    if (!isNaN(ttlValue) && ttlValue > 0 && ttlValue !== defaultTTL) {
      settings.ttl = ttlValue;
    }

    onSave(settings);
    toast.success('Token security settings saved');
  };

  return (
    <>
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-semibold">Customize Token Security</h3>
          <p className="text-muted-foreground">
            Adjust token security settings to meet your requirements
          </p>
        </div>

        <div className="grid gap-4">
          {/* Rotate Signing Keys */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Rotate Signing Keys</CardTitle>
              <CardDescription>
                Generate a new signing key pair. The old key will remain valid for a grace period.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={handleRotateKeys}>
                <RotateCw className="mr-2 h-4 w-4" />
                Rotate Keys
              </Button>
            </CardContent>
          </Card>

          {/* Override Issuer */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Override Issuer</CardTitle>
              <CardDescription>
                Use a custom issuer identifier instead of the default
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Label htmlFor="custom-issuer">Custom Issuer URL</Label>
              <Input
                id="custom-issuer"
                placeholder={defaultIssuer}
                value={customIssuer}
                onChange={(e) => setCustomIssuer(e.target.value)}
                className="font-mono"
              />
              <p className="text-sm text-muted-foreground">
                Leave empty to use default: {defaultIssuer}
              </p>
            </CardContent>
          </Card>

          {/* Upload Custom Keys */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Upload Custom Keys</CardTitle>
              <CardDescription>
                Upload your own signing key pair instead of using auto-generated keys
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={handleUploadKeys}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Custom Keys
              </Button>
            </CardContent>
          </Card>

          {/* Adjust Token TTL */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Adjust Token Lifetime</CardTitle>
              <CardDescription>
                Set how long tokens remain valid before expiring (in seconds)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Label htmlFor="token-ttl">Token Lifetime (seconds)</Label>
              <Input
                id="token-ttl"
                type="number"
                min="60"
                step="60"
                value={customTTL}
                onChange={(e) => setCustomTTL(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Default: {defaultTTL} seconds ({Math.floor(defaultTTL / 60)} minutes)
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      <UploadCustomKeysDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        onUpload={handleKeysUploaded}
      />
    </>
  );
}
