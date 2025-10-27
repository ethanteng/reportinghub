'use client';

import { useBiGeniusStore, SelectedEntity } from '@/store/useBiGeniusStore';
import { InstructionHistory, InstructionChangeType } from '../../../lib/types';
import { Plus, Trash2, Edit2, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface InstructionHistoryProps {
  entity: SelectedEntity;
}

export function InstructionHistoryView({ entity }: InstructionHistoryProps) {
  const { getInstructionHistoryForEntity } = useBiGeniusStore();

  if (!entity || entity.type === 'source') {
    return (
      <div className="text-sm text-muted-foreground">
        No history available for this item.
      </div>
    );
  }

  const history = getInstructionHistoryForEntity(entity.data.id);

  if (history.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
        <h3 className="font-semibold text-muted-foreground mb-2">No History Yet</h3>
        <p className="text-sm text-muted-foreground">
          Instruction changes will appear here as you add, edit, or delete them.
        </p>
      </div>
    );
  }

  const getChangeIcon = (changeType: InstructionChangeType) => {
    switch (changeType) {
      case InstructionChangeType.Added:
        return <Plus className="h-4 w-4" />;
      case InstructionChangeType.Edited:
        return <Edit2 className="h-4 w-4" />;
      case InstructionChangeType.Deleted:
        return <Trash2 className="h-4 w-4" />;
    }
  };

  const getChangeBadge = (changeType: InstructionChangeType) => {
    switch (changeType) {
      case InstructionChangeType.Added:
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Added
          </Badge>
        );
      case InstructionChangeType.Edited:
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Edited
          </Badge>
        );
      case InstructionChangeType.Deleted:
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Deleted
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-3">
      <div className="text-xs font-medium text-muted-foreground mb-3">
        {history.length} change{history.length !== 1 ? 's' : ''}
      </div>

      {/* Timeline */}
      <div className="relative space-y-4">
        {/* Timeline line */}
        <div className="absolute left-[15px] top-6 bottom-0 w-0.5 bg-border" />

        {history.map((entry, index) => {
          const isLast = index === history.length - 1;

          return (
            <div key={entry.id} className="relative pl-10">
              {/* Timeline dot */}
              <div
                className={`absolute left-0 top-1 h-8 w-8 rounded-full flex items-center justify-center ${
                  entry.changeType === InstructionChangeType.Added
                    ? 'bg-green-100 text-green-600'
                    : entry.changeType === InstructionChangeType.Edited
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-red-100 text-red-600'
                }`}
              >
                {getChangeIcon(entry.changeType)}
              </div>

              {/* Content */}
              <div className="bg-muted rounded-lg p-3 border">
                <div className="flex items-center justify-between mb-2">
                  {getChangeBadge(entry.changeType)}
                  <span className="text-xs text-muted-foreground" suppressHydrationWarning>
                    {new Date(entry.timestamp).toLocaleString()}
                  </span>
                </div>

                {/* Instruction content */}
                <div
                  className={`text-sm p-2 rounded ${
                    entry.changeType === InstructionChangeType.Deleted
                      ? 'bg-red-50 border border-red-200 text-red-900 line-through'
                      : 'bg-background'
                  }`}
                >
                  {entry.content}
                </div>

                {/* Show previous content for edits */}
                {entry.changeType === InstructionChangeType.Edited &&
                  entry.previousContent && (
                    <div className="mt-2 pt-2 border-t">
                      <div className="text-xs text-muted-foreground mb-1">Previous:</div>
                      <div className="text-sm p-2 rounded bg-muted line-through opacity-60">
                        {entry.previousContent}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

