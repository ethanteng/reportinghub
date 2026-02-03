'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Clock, Key, Download } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface TokenSecuritySummaryStepProps {
  issuer: string;
  ttl: number;
  onKeepDefaults: () => void;
  onCustomize: () => void;
  onDownloadKey?: () => void;
}

export function TokenSecuritySummaryStep({
  issuer,
  ttl,
  onKeepDefaults,
  onCustomize,
  onDownloadKey,
}: TokenSecuritySummaryStepProps) {
  const formatTTL = (seconds: number): string => {
    if (seconds < 60) return `${seconds} seconds`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`;
    return `${Math.floor(seconds / 3600)} hours`;
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-semibold">Token Security Settings</h3>
        <p className="text-muted-foreground">
          Review your current token security configuration
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          These settings are automatically configured and work for most use cases.
          You can customize them if you have specific security requirements.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4">
        {/* Issuer */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">Issuer</CardTitle>
            </div>
            <CardDescription>
              The identifier used in token claims to verify authenticity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <code className="text-sm bg-muted px-3 py-2 rounded block">{issuer}</code>
          </CardContent>
        </Card>

        {/* Token TTL */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">Token Lifetime</CardTitle>
            </div>
            <CardDescription>
              How long tokens remain valid before they expire
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="text-base px-3 py-1">
              {formatTTL(ttl)}
            </Badge>
          </CardContent>
        </Card>

        {/* Signing Key */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">Signing Key</CardTitle>
            </div>
            <CardDescription>
              Cryptographic key used to sign and verify tokens
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Badge variant="outline">Auto-generated signing key</Badge>
              {onDownloadKey && (
                <Button variant="outline" size="sm" onClick={onDownloadKey}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Private Key
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3 justify-end pt-4">
        <Button variant="outline" onClick={onKeepDefaults}>
          Keep Defaults
        </Button>
        <Button onClick={onCustomize}>
          Customize Settings
        </Button>
      </div>
    </div>
  );
}
