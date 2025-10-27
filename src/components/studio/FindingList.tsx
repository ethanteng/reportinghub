'use client';

import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { AnalyzerFinding, ReadinessSeverity } from '../../../lib/types';
import { useBiGeniusStore } from '@/store/useBiGeniusStore';
import { cn } from '@/lib/utils';

interface FindingListProps {
  findings: AnalyzerFinding[];
}

const severityConfig = {
  [ReadinessSeverity.Blocker]: {
    icon: AlertCircle,
    label: 'Blocker',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  [ReadinessSeverity.Warn]: {
    icon: AlertTriangle,
    label: 'Warning',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
  },
  [ReadinessSeverity.Info]: {
    icon: Info,
    label: 'Info',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
};

export function FindingList({ findings }: FindingListProps) {
  const router = useRouter();
  const { models, dataSources, setSelectedEntity } = useBiGeniusStore();

  const groupedFindings = {
    [ReadinessSeverity.Blocker]: findings.filter((f) => f.severity === ReadinessSeverity.Blocker),
    [ReadinessSeverity.Warn]: findings.filter((f) => f.severity === ReadinessSeverity.Warn),
    [ReadinessSeverity.Info]: findings.filter((f) => f.severity === ReadinessSeverity.Info),
  };

  // Get breadcrumb path for a finding
  const getBreadcrumb = (finding: AnalyzerFinding): string => {
    // Find which model this finding belongs to
    let foundModel = null;
    let foundTable = null;
    let foundColumn = null;

    for (const model of models) {
      if (finding.entityType === 'model' && model.id === finding.entityId) {
        foundModel = model;
        break;
      }
      
      for (const table of model.tables) {
        if (finding.entityType === 'table' && table.id === finding.entityId) {
          foundModel = model;
          foundTable = table;
          break;
        }
        
        for (const column of table.columns) {
          if (finding.entityType === 'column' && column.id === finding.entityId) {
            foundModel = model;
            foundTable = table;
            foundColumn = column;
            break;
          }
        }
        if (foundColumn) break;
      }
      if (foundTable || foundModel) break;
    }

    if (!foundModel) return '';

    // Find the data source for this model
    const dataSource = dataSources.find((ds) => ds.id === foundModel.sourceId);
    const parts = [dataSource?.alias || dataSource?.name || 'Unknown Source', foundModel.name];
    
    if (foundTable) parts.push(foundTable.name);
    if (foundColumn) parts.push(foundColumn.name);
    
    return parts.join(' › ');
  };

  const handleFindingClick = (finding: AnalyzerFinding) => {
    // Find which model this finding belongs to
    let targetModel = null;
    
    for (const model of models) {
      if (finding.entityType === 'model' && model.id === finding.entityId) {
        targetModel = model;
        break;
      }
      
      for (const table of model.tables) {
        if (finding.entityType === 'table' && table.id === finding.entityId) {
          targetModel = model;
          break;
        }
        
        for (const column of table.columns) {
          if (finding.entityType === 'column' && column.id === finding.entityId) {
            targetModel = model;
            break;
          }
        }
        if (targetModel) break;
      }
      if (targetModel) break;
    }

    if (!targetModel) return;

    // Encode recommendation for URL
    const recommendation = encodeURIComponent(finding.recommendation);
    const findingTitle = encodeURIComponent(finding.title);
    const severity = encodeURIComponent(finding.severity);

    // Navigate to the entity in the model page with URL params for auto-expansion and recommendation
    if (finding.entityType === 'model') {
      setSelectedEntity({ type: 'model', data: targetModel });
      router.push(`/model?entityType=model&entityId=${finding.entityId}&recommendation=${recommendation}&findingTitle=${findingTitle}&severity=${severity}`);
    } else if (finding.entityType === 'table') {
      const table = targetModel.tables.find((t) => t.id === finding.entityId);
      if (table) {
        setSelectedEntity({ type: 'table', data: table, modelId: targetModel.id });
        router.push(`/model?entityType=table&entityId=${finding.entityId}&modelId=${targetModel.id}&recommendation=${recommendation}&findingTitle=${findingTitle}&severity=${severity}`);
      }
    } else if (finding.entityType === 'column') {
      for (const table of targetModel.tables) {
        const column = table.columns.find((c) => c.id === finding.entityId);
        if (column) {
          setSelectedEntity({
            type: 'column',
            data: column,
            tableId: table.id,
            modelId: targetModel.id,
          });
          router.push(`/model?entityType=column&entityId=${finding.entityId}&tableId=${table.id}&modelId=${targetModel.id}&recommendation=${recommendation}&findingTitle=${findingTitle}&severity=${severity}`);
          break;
        }
      }
    }
  };

  if (findings.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Issues Found</h3>
        <p className="text-sm text-muted-foreground">
          Your model is in great shape! No recommendations at this time.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedFindings).map(([severity, items]) => {
        if (items.length === 0) return null;

        const config = severityConfig[severity as ReadinessSeverity];
        const Icon = config.icon;

        return (
          <div key={severity}>
            <div className="flex items-center gap-2 mb-3">
              <Icon className={cn('h-5 w-5', config.color)} />
              <h3 className="text-lg font-semibold">{config.label}s</h3>
              <Badge variant="secondary">{items.length}</Badge>
            </div>

            <div className="space-y-2">
              {items.map((finding) => {
                const breadcrumb = getBreadcrumb(finding);
                return (
                  <Card
                    key={finding.id}
                    className={cn(
                      'p-4 cursor-pointer transition-colors hover:shadow-md',
                      config.borderColor
                    )}
                    onClick={() => handleFindingClick(finding)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {breadcrumb && (
                          <div className="text-xs text-muted-foreground mb-1 font-mono">
                            {breadcrumb}
                          </div>
                        )}
                        <h4 className="font-medium text-sm mb-2">{finding.title}</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          {finding.recommendation}
                        </p>
                        <Button variant="link" className="h-auto p-0 text-xs">
                          View in Model
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

