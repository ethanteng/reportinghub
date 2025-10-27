'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { StatusPill } from './StatusPill';
import { Database, Server, FileText, Globe, RefreshCw, Edit2, Check } from 'lucide-react';
import { DataSource, DataSourceType, SyncStatus } from '../../../lib/types';
import { cn } from '@/lib/utils';

interface SourceCardProps {
  source: DataSource;
  selected?: boolean;
  onSelect?: (id: string) => void;
  onSync?: (id: string) => void;
  onAliasUpdate?: (id: string, alias: string) => void;
  onClick?: () => void;
}

const iconMap = {
  [DataSourceType.PowerBI]: Database,
  [DataSourceType.SQL]: Server,
  [DataSourceType.File]: FileText,
  [DataSourceType.URL]: Globe,
};

export function SourceCard({
  source,
  selected,
  onSelect,
  onSync,
  onAliasUpdate,
  onClick,
}: SourceCardProps) {
  const [editingAlias, setEditingAlias] = useState(false);
  const [aliasValue, setAliasValue] = useState(source.alias || source.name);

  const Icon = iconMap[source.type];
  const isSyncing = source.status === SyncStatus.Syncing;

  const handleSaveAlias = () => {
    onAliasUpdate?.(source.id, aliasValue);
    setEditingAlias(false);
  };

  const handleSync = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSync?.(source.id);
  };

  const handleCheckboxChange = (checked: boolean) => {
    onSelect?.(source.id);
  };

  return (
    <Card
      className={cn(
        'p-4 cursor-pointer transition-colors hover:border-primary/50',
        selected && 'border-primary bg-primary/5'
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {onSelect && (
          <Checkbox
            checked={selected}
            onCheckedChange={handleCheckboxChange}
            onClick={(e) => e.stopPropagation()}
            className="mt-1"
          />
        )}

        <div className="flex-shrink-0">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-sm truncate">{source.name}</h3>
            <StatusPill status={source.status} />
          </div>

          {editingAlias ? (
            <div className="flex items-center gap-1 mb-2" onClick={(e) => e.stopPropagation()}>
              <Input
                value={aliasValue}
                onChange={(e) => setAliasValue(e.target.value)}
                className="h-7 text-xs"
                placeholder="Enter alias"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveAlias();
                  if (e.key === 'Escape') setEditingAlias(false);
                }}
              />
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleSaveAlias}>
                <Check className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 mb-2">
              <p className="text-xs text-muted-foreground truncate">
                {source.alias || 'No alias'}
              </p>
              <Button
                size="icon"
                variant="ghost"
                className="h-5 w-5"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingAlias(true);
                }}
              >
                <Edit2 className="h-3 w-3" />
              </Button>
            </div>
          )}

          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            onClick={handleSync}
            disabled={isSyncing}
          >
            <RefreshCw className={cn('h-3 w-3 mr-1', isSyncing && 'animate-spin')} />
            {isSyncing ? 'Syncing...' : 'Sync'}
          </Button>

          {source.lastSyncAt && (
            <p className="text-xs text-muted-foreground mt-2" suppressHydrationWarning>
              Last synced: {new Date(source.lastSyncAt).toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

