'use client';

import { Suspense } from 'react';
import { X, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useBiGeniusStore, SelectedEntity } from '@/store/useBiGeniusStore';
import { InstructionEditor } from './InstructionEditor';
import { InstructionHistoryView } from './InstructionHistory';
import { DataSource, Table, Column, ReadinessSeverity } from '../../../lib/types';

function InspectorPanelContent() {
  const searchParams = useSearchParams();
  const { selectedEntity, setInspectorOpen, setSelectedEntity } = useBiGeniusStore();
  
  const recommendation = searchParams.get('recommendation');
  const findingTitle = searchParams.get('findingTitle');
  const severity = searchParams.get('severity') as ReadinessSeverity | null;

  if (!selectedEntity) {
    return null;
  }

  const handleClose = () => {
    setSelectedEntity(null);
    setInspectorOpen(false);
  };

  // Get styling based on severity
  const getSeverityStyle = () => {
    switch (severity) {
      case ReadinessSeverity.Blocker:
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: AlertCircle,
          iconColor: 'text-red-600',
          titleColor: 'text-red-900',
          textColor: 'text-red-700',
        };
      case ReadinessSeverity.Warn:
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          icon: AlertTriangle,
          iconColor: 'text-yellow-600',
          titleColor: 'text-yellow-900',
          textColor: 'text-yellow-700',
        };
      case ReadinessSeverity.Info:
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: Info,
          iconColor: 'text-blue-600',
          titleColor: 'text-blue-900',
          textColor: 'text-blue-700',
        };
    }
  };

  const severityStyle = getSeverityStyle();
  const SeverityIcon = severityStyle.icon;

  return (
    <div className="w-96 border-l bg-background flex flex-col max-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold text-sm">Inspector</h3>
        <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Readiness Recommendation Banner */}
      {recommendation && findingTitle && (
        <div className={`mx-4 mt-4 p-3 ${severityStyle.bg} border ${severityStyle.border} rounded-lg`}>
          <div className="flex items-start gap-2">
            <SeverityIcon className={`h-4 w-4 ${severityStyle.iconColor} flex-shrink-0 mt-0.5`} />
            <div className="flex-1 min-w-0">
              <div className={`text-xs font-semibold ${severityStyle.titleColor} mb-1`}>
                From Readiness Analysis
              </div>
              <div className={`text-xs font-medium ${severityStyle.titleColor} mb-1`}>
                {decodeURIComponent(findingTitle)}
              </div>
              <div className={`text-xs ${severityStyle.textColor}`}>
                {decodeURIComponent(recommendation)}
              </div>
            </div>
          </div>
        </div>
      )}

          {/* Content */}
          <Tabs 
            defaultValue={selectedEntity.type === 'source' ? 'summary' : 'instructions'} 
            className="flex-1 flex flex-col overflow-hidden"
          >
            <TabsList className="mx-4 mt-2">
              <TabsTrigger value="summary" className="text-xs">
                Summary
              </TabsTrigger>
              {selectedEntity.type !== 'source' && (
                <TabsTrigger value="instructions" className="text-xs">
                  Instructions
                </TabsTrigger>
              )}
              {selectedEntity.type !== 'source' && (
                <TabsTrigger value="history" className="text-xs">
                  History
                </TabsTrigger>
              )}
            </TabsList>

            <div className="flex-1 overflow-y-auto">
              <TabsContent value="summary" className="p-4 mt-0">
                <SummaryTab entity={selectedEntity} />
              </TabsContent>

              {selectedEntity.type !== 'source' && (
                <TabsContent value="instructions" className="p-4 mt-0">
                  <InstructionEditor entity={selectedEntity} />
                </TabsContent>
              )}

              {selectedEntity.type !== 'source' && (
                <TabsContent value="history" className="p-4 mt-0">
                  <InstructionHistoryView entity={selectedEntity} />
                </TabsContent>
              )}
            </div>
          </Tabs>
    </div>
  );
}

function SummaryTab({ entity }: { entity: NonNullable<SelectedEntity> }) {
  if (entity.type === 'source') {
    const source = entity.data as DataSource;
    return (
      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Name</label>
          <p className="text-sm mt-1">{source.name}</p>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Alias</label>
          <p className="text-sm mt-1">{source.alias || '—'}</p>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Type</label>
          <p className="text-sm mt-1 capitalize">{source.type}</p>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Details</label>
          <pre className="text-xs mt-1 bg-muted p-2 rounded overflow-x-auto">
            {JSON.stringify(source.details, null, 2)}
          </pre>
        </div>
        {source.lastSyncAt && (
          <div>
            <label className="text-xs font-medium text-muted-foreground">Last Synced</label>
            <p className="text-sm mt-1" suppressHydrationWarning>
              {new Date(source.lastSyncAt).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    );
  }

  if (entity.type === 'model') {
    const model = entity.data;
    return (
      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Name</label>
          <p className="text-sm mt-1">{model.name}</p>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Version</label>
          <p className="text-sm mt-1">{model.versionTag}</p>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Tables</label>
          <p className="text-sm mt-1">{model.tables.length}</p>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Total Columns</label>
          <p className="text-sm mt-1">
            {model.tables.reduce((sum, t) => sum + t.columns.length, 0)}
          </p>
        </div>
      </div>
    );
  }

  if (entity.type === 'table') {
    const table = entity.data as Table;
    return (
      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Table Name</label>
          <p className="text-sm mt-1">{table.name}</p>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Columns</label>
          <p className="text-sm mt-1">{table.columns.length}</p>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Column List</label>
          <div className="text-xs mt-1 space-y-1">
            {table.columns.map((col) => (
              <div key={col.id} className="flex justify-between py-1 px-2 bg-muted rounded">
                <span>{col.name}</span>
                <span className="text-muted-foreground">{col.dataType}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (entity.type === 'column') {
    const column = entity.data as Column;
    return (
      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Column Name</label>
          <p className="text-sm mt-1">{column.name}</p>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Data Type</label>
          <p className="text-sm mt-1 capitalize">{column.dataType}</p>
        </div>
      </div>
    );
  }

  return null;
}

export function InspectorPanel() {
  return (
    <Suspense fallback={null}>
      <InspectorPanelContent />
    </Suspense>
  );
}

