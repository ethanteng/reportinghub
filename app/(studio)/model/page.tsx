'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { MultiModelTreeView } from '@/components/studio/MultiModelTreeView';
import { Breadcrumbs } from '@/components/studio/Breadcrumbs';
import { EmptyState } from '@/components/studio/EmptyState';
import { AgentChatWidget } from '@/components/studio/AgentChatWidget';
import { useBiGeniusStore } from '@/store/useBiGeniusStore';
import { Database, Server, FileText, Globe, Network, Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { DataSourceType } from '../../../lib/types';

const iconMap = {
  [DataSourceType.PowerBI]: Database,
  [DataSourceType.SQL]: Server,
  [DataSourceType.File]: FileText,
  [DataSourceType.URL]: Globe,
};

export default function ModelPage() {
  const searchParams = useSearchParams();
  const { models, selectedEntity, dataSources, agentConfigs, setSelectedEntity, getCurrentAgent } = useBiGeniusStore();
  const [filterWithInstructions, setFilterWithInstructions] = useState(false);
  const [initialExpandedModels, setInitialExpandedModels] = useState<Set<string>>();
  const [initialExpandedTables, setInitialExpandedTables] = useState<Set<string>>();
  const [showTestChat, setShowTestChat] = useState(false);
  
  // Get the current agent config to see which sources are connected
  const currentConfig = agentConfigs[agentConfigs.length - 1];
  const currentAgent = getCurrentAgent();
  const connectedSources = dataSources.filter((ds) => 
    currentConfig?.sourceIds.includes(ds.id)
  );

  // Handle navigation from findings - expand tree and select entity
  useEffect(() => {
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');
    const modelId = searchParams.get('modelId');
    const tableId = searchParams.get('tableId');

    if (entityType && entityId) {
      const expandedModels = new Set<string>();
      const expandedTables = new Set<string>();

      if (entityType === 'model') {
        expandedModels.add(entityId);
        const model = models.find((m) => m.id === entityId);
        if (model) {
          setSelectedEntity({ type: 'model', data: model });
        }
      } else if (entityType === 'table' && modelId) {
        expandedModels.add(modelId);
        const model = models.find((m) => m.id === modelId);
        const table = model?.tables.find((t) => t.id === entityId);
        if (table && model) {
          setSelectedEntity({ type: 'table', data: table, modelId: model.id });
        }
      } else if (entityType === 'column' && modelId && tableId) {
        expandedModels.add(modelId);
        expandedTables.add(tableId);
        const model = models.find((m) => m.id === modelId);
        const table = model?.tables.find((t) => t.id === tableId);
        const column = table?.columns.find((c) => c.id === entityId);
        if (column && table && model) {
          setSelectedEntity({
            type: 'column',
            data: column,
            tableId: table.id,
            modelId: model.id,
          });
        }
      }

      // Always update the expansion state
      setInitialExpandedModels(expandedModels);
      setInitialExpandedTables(expandedTables);
    }
  }, [searchParams, models, setSelectedEntity]);

  // Create a key that changes when URL params change to force tree re-mount
  const treeKey = searchParams.toString();

  // Show empty state if no data sources are connected
  if (connectedSources.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="border-b bg-background sticky top-0 z-10">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-semibold">Semantic Models & Instructions</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Browse model structures, manage instructions, and configure guidance for the AI agent
            </p>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            icon={Network}
            title="No Data Sources Connected"
            description="Add data sources first to see and configure semantic models for your AI agent."
            action={
              <Link href="/sources">
                <Button size="lg">
                  <Database className="h-4 w-4 mr-2" />
                  Go to Data Sources
                </Button>
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b bg-background sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold">Semantic Models & Instructions</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Browse model structures, manage instructions, and configure guidance for the AI agent
              </p>
            </div>
            {currentAgent && (
              <Button onClick={() => setShowTestChat(true)} variant="outline">
                <Play className="h-4 w-4 mr-2" />
                Test Agent
              </Button>
            )}
          </div>
        </div>
        
        {/* Connected Data Sources */}
        {connectedSources.length > 0 && (
          <div className="px-6 pb-4">
            <div className="text-xs font-medium text-muted-foreground mb-2">
              Connected Data Sources ({connectedSources.length})
            </div>
            <div className="flex flex-wrap gap-2">
              {connectedSources.map((source) => {
                const Icon = iconMap[source.type];
                return (
                  <Badge key={source.id} variant="secondary" className="gap-2">
                    <Icon className="h-3 w-3" />
                    {source.alias || source.name}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Instruction Filter */}
        <div className="px-6 pb-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="filter-instructions"
              checked={filterWithInstructions}
              onCheckedChange={(checked) => setFilterWithInstructions(checked as boolean)}
            />
            <Label htmlFor="filter-instructions" className="text-sm cursor-pointer">
              Show only items with instructions
            </Label>
          </div>
        </div>
        
        <Breadcrumbs selectedEntity={selectedEntity} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <MultiModelTreeView
          key={treeKey}
          models={models}
          showInstructionBadges={true}
          filterWithInstructions={filterWithInstructions}
          initialExpandedModels={initialExpandedModels}
          initialExpandedTables={initialExpandedTables}
        />
      </div>

      {/* Test Chat Widget */}
      {showTestChat && currentAgent && (
        <AgentChatWidget
          agent={currentAgent}
          onClose={() => setShowTestChat(false)}
        />
      )}
    </div>
  );
}

