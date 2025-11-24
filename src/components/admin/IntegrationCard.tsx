'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from './StatusBadge';
import { Integration } from '@/lib/data/admin/integrations';
import { Settings } from 'lucide-react';

interface IntegrationCardProps {
  integration: Integration;
  onConfigure: (integration: Integration) => void;
}

export function IntegrationCard({ integration, onConfigure }: IntegrationCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{integration.name}</CardTitle>
            <CardDescription className="mt-1">{integration.description}</CardDescription>
          </div>
          <StatusBadge status={integration.status} />
        </div>
      </CardHeader>
      <CardContent>
        <Button onClick={() => onConfigure(integration)} className="w-full" variant="outline">
          <Settings className="mr-2 h-4 w-4" />
          Configure
        </Button>
      </CardContent>
    </Card>
  );
}

