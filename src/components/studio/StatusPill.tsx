import { Badge } from '@/components/ui/badge';
import { SyncStatus, AnalyzerStatus } from '../../../lib/types';
import { Loader2 } from 'lucide-react';

interface StatusPillProps {
  status: SyncStatus | AnalyzerStatus | string;
  className?: string;
}

export function StatusPill({ status, className }: StatusPillProps) {
  const getVariant = () => {
    switch (status) {
      case SyncStatus.Success:
      case AnalyzerStatus.Success:
        return 'default';
      case SyncStatus.Syncing:
      case AnalyzerStatus.Running:
      case AnalyzerStatus.Queued:
        return 'secondary';
      case SyncStatus.Error:
      case AnalyzerStatus.Error:
        return 'destructive';
      case SyncStatus.Idle:
      case AnalyzerStatus.NotRun:
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getLabel = () => {
    switch (status) {
      case SyncStatus.Success:
        return 'Synced';
      case SyncStatus.Syncing:
        return 'Syncing...';
      case SyncStatus.Error:
        return 'Error';
      case SyncStatus.Idle:
        return 'Not synced';
      case AnalyzerStatus.Success:
        return 'Complete';
      case AnalyzerStatus.Running:
        return 'Running...';
      case AnalyzerStatus.Queued:
        return 'Queued';
      case AnalyzerStatus.Error:
        return 'Error';
      case AnalyzerStatus.NotRun:
        return 'Not run';
      default:
        return status;
    }
  };

  const isLoading =
    status === SyncStatus.Syncing ||
    status === AnalyzerStatus.Running ||
    status === AnalyzerStatus.Queued;

  return (
    <Badge variant={getVariant()} className={`whitespace-nowrap ${className}`}>
      {isLoading && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
      {getLabel()}
    </Badge>
  );
}

