'use client';

import { useState } from 'react';
import { SectionTabs } from '@/components/admin/SectionTabs';
import { UploadCustomKeysDialog } from '@/components/admin/UploadCustomKeysDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Info, RotateCw, Upload, Download } from 'lucide-react';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const tabs = [
  { name: 'API Keys', href: '/admin/developer-settings' },
  { name: 'OAuth / SSO Applications', href: '/admin/developer-settings/oauth-apps' },
  { name: 'Token Security', href: '/admin/developer-settings/token-security' },
];

// Mock RSA key pair (public key only shown)
const mockRsaPublicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyX8X8X8X8X8X8X8X8X8X
8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X
8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X
8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X
8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X
8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X
8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X
QIDAQAB
-----END PUBLIC KEY-----`;

// Mock private key (for download only)
const mockRsaPrivateKey = `-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAyX8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X
8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X
8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X
8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X
8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X
8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X
8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X
QIDAQAB
-----END RSA PRIVATE KEY-----`;

const mockIssuer = 'https://api.reportinghub.com';
const mockTokenTTL = 3600; // seconds (1 hour)

export default function TokenSecurityPage() {
  const [readOnly, setReadOnly] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customIssuer, setCustomIssuer] = useState('');
  const [lastRotated] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  const handleRotateKeys = () => {
    toast.success('RSA key pair rotated successfully');
  };

  const handleUploadKeys = () => {
    setIsUploadDialogOpen(true);
  };

  const handleKeysUploaded = (publicKey: string, privateKey: string) => {
    // Mock: In a real app, this would save the keys to the backend
    console.log('Keys uploaded:', { publicKey: publicKey.substring(0, 50) + '...', privateKey: '***hidden***' });
    setIsUploadDialogOpen(false);
  };

  const handleDownloadPrivateKey = () => {
    // Create a blob with the private key content
    const blob = new Blob([mockRsaPrivateKey], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rsa-private-key-${new Date().toISOString().split('T')[0]}.pem`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Private key downloaded');
  };

  const handleSaveIssuer = () => {
    if (!customIssuer.trim()) {
      toast.error('Please enter a valid issuer URL');
      return;
    }
    toast.success('Issuer updated successfully');
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

      <div className="flex items-center justify-between py-4 border-b">
        <div>
          <Label htmlFor="advanced-toggle" className="text-base font-medium">
            Show Advanced Options
          </Label>
          <p className="text-sm text-muted-foreground">
            Enable custom key upload and issuer override
          </p>
        </div>
        <Switch
          id="advanced-toggle"
          checked={showAdvanced}
          onCheckedChange={setShowAdvanced}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>RSA Key Pair</CardTitle>
          <CardDescription>
            Auto-generated RSA key pair used for token signing and verification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Public Key</Label>
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>The public key is safe to share and is used to verify tokens</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <Textarea
              value={mockRsaPublicKey}
              readOnly
              className="font-mono text-xs"
              rows={8}
            />
            {showAdvanced && (
              <div className="flex justify-start">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadPrivateKey}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Private Key
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <p className="text-sm font-medium">Last Rotated</p>
              <p className="text-sm text-muted-foreground">
                {new Date(lastRotated).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleRotateKeys}>
                <RotateCw className="mr-2 h-4 w-4" />
                Rotate Keys
              </Button>
              {showAdvanced && (
                <Button variant="outline" onClick={handleUploadKeys}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Custom Keys
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Issuer Configuration</CardTitle>
          <CardDescription>
            The issuer identifier used in token claims
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Current Issuer</Label>
            <Input value={mockIssuer} readOnly className="font-mono" />
            <p className="text-sm text-muted-foreground">
              Auto-assigned by the system
            </p>
          </div>

          {showAdvanced && (
            <div className="space-y-2 pt-4 border-t">
              <Label htmlFor="custom-issuer">Custom Issuer (Advanced)</Label>
              <Input
                id="custom-issuer"
                placeholder="https://custom-issuer.example.com"
                value={customIssuer}
                onChange={(e) => setCustomIssuer(e.target.value)}
                className="font-mono"
              />
              <p className="text-sm text-muted-foreground">
                Override the default issuer. Use with caution.
              </p>
              <Button onClick={handleSaveIssuer} variant="outline">
                Save Custom Issuer
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* <Card>
        <CardHeader>
          <CardTitle>Access Control</CardTitle>
          <CardDescription>
            Configure read-only access for token security settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="readonly-toggle">Read-Only Mode</Label>
              <p className="text-sm text-muted-foreground">
                When enabled, token security settings cannot be modified
              </p>
            </div>
            <Switch
              id="readonly-toggle"
              checked={readOnly}
              onCheckedChange={setReadOnly}
            />
          </div>
        </CardContent>
      </Card> */}

      <UploadCustomKeysDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        onUpload={handleKeysUploaded}
      />
    </div>
  );
}
