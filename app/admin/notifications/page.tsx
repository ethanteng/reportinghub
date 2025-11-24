'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/admin/FormField';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';

export default function NotificationsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [slackNotifications, setSlackNotifications] = useState(false);
  const [webhookNotifications, setWebhookNotifications] = useState(false);
  const [emailAddress, setEmailAddress] = useState('admin@example.com');

  const handleSave = () => {
    toast.success('Notification settings saved');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
        <p className="text-muted-foreground">
          Configure notification preferences and channels
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>
            Receive notifications via email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-toggle">Enable Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Send notifications to the configured email address
              </p>
            </div>
            <Switch
              id="email-toggle"
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>
          {emailNotifications && (
            <FormField label="Email Address" description="Primary email for notifications">
              <Input
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                disabled
              />
            </FormField>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Slack Integration</CardTitle>
          <CardDescription>
            Send notifications to Slack channels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="slack-toggle">Enable Slack Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Post notifications to configured Slack channels
              </p>
            </div>
            <Switch
              id="slack-toggle"
              checked={slackNotifications}
              onCheckedChange={setSlackNotifications}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Webhook Notifications</CardTitle>
          <CardDescription>
            Send notifications via webhooks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="webhook-toggle">Enable Webhook Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Send HTTP POST requests to configured webhook URLs
              </p>
            </div>
            <Switch
              id="webhook-toggle"
              checked={webhookNotifications}
              onCheckedChange={setWebhookNotifications}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
          <CardDescription>
            Select which events trigger notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>User Invitations</Label>
              <Switch defaultChecked disabled />
            </div>
            <div className="flex items-center justify-between">
              <Label>Tenant Creation</Label>
              <Switch defaultChecked disabled />
            </div>
            <div className="flex items-center justify-between">
              <Label>Billing Updates</Label>
              <Switch defaultChecked disabled />
            </div>
            <div className="flex items-center justify-between">
              <Label>System Alerts</Label>
              <Switch defaultChecked disabled />
            </div>
            <div className="flex items-center justify-between">
              <Label>Security Events</Label>
              <Switch defaultChecked disabled />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled>
          Save Changes
        </Button>
      </div>
    </div>
  );
}

