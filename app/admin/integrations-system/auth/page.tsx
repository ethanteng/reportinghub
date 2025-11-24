'use client';

// Legacy: "Auth Schemes" → New: Integrations & System > Authentication
// Legacy: "Authorization Server Setup" → Mapped here

import { SectionTabs } from '@/components/admin/SectionTabs';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { FormField } from '@/components/admin/FormField';
import { toast } from 'sonner';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from '@/components/admin/StatusBadge';

const tabs = [
  { name: 'Authentication', href: '/admin/integrations-system/auth' },
  { name: 'Email & SMTP', href: '/admin/integrations-system/smtp' },
  { name: 'Power BI', href: '/admin/integrations-system/powerbi' },
  { name: 'Webhooks', href: '/admin/integrations-system/webhooks' },
  { name: 'App Settings', href: '/admin/integrations-system/app-settings' },
  { name: 'Azure Metrics', href: '/admin/integrations-system/metrics' },
];

type AuthMethod = 'azure-ad' | 'sso' | 'api-keys';

// Mock auth schemes
const authSchemes = [
  { name: 'Microsoft Entra ID', scheme: 'Microsoft Entra ID', verified: true },
  { name: 'Auth0', scheme: 'Auth0 Authentication', verified: true },
  { name: 'Okta', scheme: 'Okta', verified: true },
];

export default function AuthPage() {
  const [authMethod, setAuthMethod] = useState<AuthMethod>('azure-ad');
  const [mfaEnabled, setMfaEnabled] = useState(false);

  const handleTestConnection = () => {
    toast.success('Connection test successful!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Integrations & System</h2>
        <p className="text-muted-foreground">
          Configure authentication methods and security settings
        </p>
      </div>

      <SectionTabs tabs={tabs} basePath="/admin/integrations-system" />

      <Card>
        <CardHeader>
          <CardTitle>Authentication Schemes</CardTitle>
          <CardDescription>
            Manage authentication providers and their configurations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex justify-end">
            <Button disabled>Add Authentication Scheme</Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Authentication Name</TableHead>
                <TableHead>Auth Scheme</TableHead>
                <TableHead>Verified</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {authSchemes.map((auth) => (
                <TableRow key={auth.name}>
                  <TableCell className="font-medium">{auth.name}</TableCell>
                  <TableCell>{auth.scheme}</TableCell>
                  <TableCell>
                    {auth.verified ? (
                      <StatusBadge status="Connected" />
                    ) : (
                      <StatusBadge status="Disconnected" />
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" disabled>
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Default Authentication Method</CardTitle>
          <CardDescription>
            Choose how users authenticate to the platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup value={authMethod} onValueChange={(value) => setAuthMethod(value as AuthMethod)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="azure-ad" id="azure-ad" />
              <Label htmlFor="azure-ad" className="font-normal cursor-pointer">
                Azure AD
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="inline ml-2 h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Use Azure Active Directory for user authentication</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="sso" id="sso" />
              <Label htmlFor="sso" className="font-normal cursor-pointer">
                SSO (Single Sign-On)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="api-keys" id="api-keys" />
              <Label htmlFor="api-keys" className="font-normal cursor-pointer">
                API Keys
              </Label>
            </div>
          </RadioGroup>

          {authMethod === 'azure-ad' && (
            <div className="space-y-4 pt-4 border-t">
              <FormField label="Tenant ID" description="Your Azure AD tenant identifier">
                <Input placeholder="contoso.onmicrosoft.com" disabled />
              </FormField>
              <FormField label="Client ID" description="Application (client) ID from Azure AD">
                <Input placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" disabled />
              </FormField>
              <Button onClick={handleTestConnection} disabled>
                Test Connection
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Multi-Factor Authentication (MFA)</CardTitle>
          <CardDescription>
            Require additional verification for user logins
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="mfa-toggle">Enable MFA</Label>
              <p className="text-sm text-muted-foreground">
                Users will be required to verify their identity using a second factor
              </p>
            </div>
            <Switch
              id="mfa-toggle"
              checked={mfaEnabled}
              onCheckedChange={setMfaEnabled}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

