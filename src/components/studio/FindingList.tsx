'use client';

import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  ChevronRight,
} from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
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
    bgColor: 'bg-red-100',
    borderColor: 'border-red-200',
  },
  [ReadinessSeverity.Warn]: {
    icon: AlertTriangle,
    label: 'Warning',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-200',
  },
  [ReadinessSeverity.Info]: {
    icon: Info,
    label: 'Quick Fix',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200',
  },
};

export function FindingList({ findings }: FindingListProps) {
  const router = useRouter();
  const { models, dataSources } = useBiGeniusStore();

  const blockers = findings.filter(
    (f) => f.severity === ReadinessSeverity.Blocker
  );
  const warnings = findings.filter(
    (f) => f.severity === ReadinessSeverity.Warn
  );
  const quickFixes = findings.filter(
    (f) => f.severity === ReadinessSeverity.Info
  );
  const riskFindings = [...blockers, ...warnings];
  const defaultTab = riskFindings.length > 0 ? 'risk' : 'quick';

  const getBreadcrumb = (finding: AnalyzerFinding): string => {
    let foundModel: (typeof models)[number] | null = null;
    let foundTable: (typeof models)[number]['tables'][number] | null = null;
    let foundColumn:
      | (typeof models)[number]['tables'][number]['columns'][number]
      | null = null;

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

    const dataSource = dataSources.find((ds) => ds.id === foundModel!.sourceId);
    const parts = [
      dataSource?.alias || dataSource?.name || 'Unknown Source',
      foundModel.name,
    ];

    if (foundTable) parts.push(foundTable.name);
    if (foundColumn) parts.push(foundColumn.name);

    return parts.join(' › ');
  };

  const handleFindingClick = (finding: AnalyzerFinding) => {
    let targetModel: (typeof models)[number] | null = null;

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

    const recommendation = encodeURIComponent(finding.recommendation);
    const findingTitle = encodeURIComponent(finding.title);
    const severity = encodeURIComponent(finding.severity);

    if (finding.entityType === 'model') {
      router.push(
        `/model?entityType=model&entityId=${finding.entityId}&recommendation=${recommendation}&findingTitle=${findingTitle}&severity=${severity}`
      );
    } else if (finding.entityType === 'table') {
      router.push(
        `/model?entityType=table&entityId=${finding.entityId}&modelId=${targetModel.id}&recommendation=${recommendation}&findingTitle=${findingTitle}&severity=${severity}`
      );
    } else if (finding.entityType === 'column') {
      for (const table of targetModel.tables) {
        const column = table.columns.find((c) => c.id === finding.entityId);
        if (column) {
          router.push(
            `/model?entityType=column&entityId=${finding.entityId}&tableId=${table.id}&modelId=${targetModel.id}&recommendation=${recommendation}&findingTitle=${findingTitle}&severity=${severity}`
          );
          break;
        }
      }
    }
  };

  const renderFindingCard = (finding: AnalyzerFinding) => {
    const config = severityConfig[finding.severity];
    const Icon = config.icon;
    const breadcrumb = getBreadcrumb(finding);

    return (
      <Card
        key={finding.id}
        className={cn(
          'p-4 cursor-pointer transition-all hover:shadow-lg border-l-4',
          config.borderColor
        )}
        onClick={() => handleFindingClick(finding)}
      >
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'rounded-md p-2 flex items-center justify-center',
              config.bgColor
            )}
          >
            <Icon className={cn('h-4 w-4', config.color)} />
          </div>
          <div className="flex-1 min-w-0">
            {breadcrumb && (
              <div className="text-[11px] text-muted-foreground mb-1 font-mono truncate">
                {breadcrumb}
              </div>
            )}
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className={cn('text-xs', config.color)}>
                {config.label}
              </Badge>
              <span className="text-[11px] text-muted-foreground">
                Impact: {finding.severity === ReadinessSeverity.Info ? 'Quality' : 'Accuracy'}
              </span>
            </div>
            <h4 className="font-medium text-sm">{finding.title}</h4>
            <p className="text-sm text-muted-foreground mt-2">
              {finding.recommendation}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={(event) => {
                  event.stopPropagation();
                  handleFindingClick(finding);
                }}
              >
                Open in Model
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
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
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="grid grid-cols-2 max-w-md">
        <TabsTrigger value="risk">
          Warnings &amp; Blockers ({riskFindings.length})
        </TabsTrigger>
        <TabsTrigger value="quick">
          Quick Wins ({quickFixes.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="risk" className="mt-4 space-y-6">
        <p className="text-xs text-muted-foreground">
          Tackle blockers first to prevent incorrect answers. Address warnings
          next to improve reliability.
        </p>

        {blockers.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <h4 className="text-sm font-semibold">Blockers</h4>
              <Badge variant="secondary">{blockers.length}</Badge>
            </div>
            <div className="space-y-3">
              {blockers.map(renderFindingCard)}
            </div>
          </div>
        )}

        {warnings.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <h4 className="text-sm font-semibold">Warnings</h4>
              <Badge variant="secondary">{warnings.length}</Badge>
            </div>
            <div className="space-y-3">
              {warnings.map(renderFindingCard)}
            </div>
          </div>
        )}

        {riskFindings.length === 0 && (
          <Card className="p-6 text-center text-sm text-muted-foreground">
            No warnings or blockers detected.
          </Card>
        )}
      </TabsContent>

      <TabsContent value="quick" className="mt-4 space-y-3">
        <p className="text-xs text-muted-foreground">
          Apply these improvements to tighten responses and reduce follow-up work.
        </p>

        {quickFixes.length > 0 ? (
          <div className="space-y-3">{quickFixes.map(renderFindingCard)}</div>
        ) : (
          <Card className="p-6 text-center text-sm text-muted-foreground">
            No quick wins available right now.
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
}

