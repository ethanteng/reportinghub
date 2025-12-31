'use client';

import { Badge } from '@/components/ui/badge';
import { useBiGeniusStore } from '@/store/useBiGeniusStore';
import { AgentStatus } from '../../../lib/types';
import { cn } from '@/lib/utils';

export function VersionContext() {
  const { getCurrentAgent } = useBiGeniusStore();
  const currentAgent = getCurrentAgent();

  if (!currentAgent) {
    return null;
  }

  const isLive = currentAgent.status === AgentStatus.Live;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-muted-foreground">Editing</span>
      <Badge
        variant={isLive ? 'default' : 'secondary'}
        className="font-medium"
      >
        {currentAgent.versionTag}
      </Badge>
      <Badge
        variant={isLive ? 'default' : 'outline'}
        className={cn(
          "font-medium",
          isLive && "bg-green-600 text-white hover:bg-green-700 border-green-600"
        )}
      >
        {isLive ? 'Live' : 'Draft'}
      </Badge>
    </div>
  );
}

