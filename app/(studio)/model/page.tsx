'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { MultiModelTreeView } from '@/components/studio/MultiModelTreeView';
import { EmptyState } from '@/components/studio/EmptyState';
import { AgentChatWidget } from '@/components/studio/AgentChatWidget';
import { useBiGeniusStore } from '@/store/useBiGeniusStore';
import { Database, Server, FileText, Globe, Network, Play, Edit3, Check, X, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { DataSourceType } from '../../../lib/types';
import { toast } from 'sonner';

const iconMap = {
  [DataSourceType.PowerBI]: Database,
  [DataSourceType.SQL]: Server,
  [DataSourceType.File]: FileText,
  [DataSourceType.URL]: Globe,
};

function ModelPageContent() {
  const searchParams = useSearchParams();
  const {
    models,
    selectedEntity,
    dataSources,
    setSelectedEntity,
    getCurrentAgent,
    updateAgentConfig,
    getAnalyzerRunForModel,
  } = useBiGeniusStore();
  const [filterWithInstructions, setFilterWithInstructions] = useState(false);
  const [initialExpandedModels, setInitialExpandedModels] = useState<Set<string>>();
  const [initialExpandedTables, setInitialExpandedTables] = useState<Set<string>>();
  const [showTestChat, setShowTestChat] = useState(false);
  const [editingInstructions, setEditingInstructions] = useState(false);
  const [instructionsText, setInstructionsText] = useState('');
  
  // Get the current agent config to see which sources are connected
  const currentAgent = getCurrentAgent();
  const connectedSources = dataSources.filter((ds) => 
    currentAgent?.sourceIds.includes(ds.id)
  );
  
  // Filter models to only show those from connected sources
  const connectedSourceIds = connectedSources.map(ds => ds.id);
  const connectedModels = models.filter(model => 
    connectedSourceIds.includes(model.sourceId)
  );

  const primaryModel =
    connectedModels.find((m) => m.id === currentAgent?.modelId) || connectedModels[0];
  const analyzerRun = primaryModel ? getAnalyzerRunForModel(primaryModel.id) : null;
  const aiNarrative =
    analyzerRun?.summary?.narrative?.trim() || primaryModel?.description?.trim() || '';

  // Initialize instructions text when agent loads
  useEffect(() => {
    if (currentAgent) {
      setInstructionsText(currentAgent.customInstructions || '');
    }
  }, [currentAgent]);

  const handleSaveInstructions = () => {
    if (currentAgent) {
      updateAgentConfig(currentAgent.id, {
        customInstructions: instructionsText.trim() || undefined,
      });
      setEditingInstructions(false);
      toast.success('Agent instructions updated');
    }
  };

  const handleCancelEdit = () => {
    setInstructionsText(currentAgent?.customInstructions || '');
    setEditingInstructions(false);
  };

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
        const model = connectedModels.find((m) => m.id === entityId);
        if (model) {
          setSelectedEntity({ type: 'model', data: model });
        }
      } else if (entityType === 'table' && modelId) {
        expandedModels.add(modelId);
        const model = connectedModels.find((m) => m.id === modelId);
        const table = model?.tables.find((t) => t.id === entityId);
        if (table && model) {
          setSelectedEntity({ type: 'table', data: table, modelId: model.id });
        }
      } else if (entityType === 'column' && modelId && tableId) {
        expandedModels.add(modelId);
        expandedTables.add(tableId);
        const model = connectedModels.find((m) => m.id === modelId);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

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
      <div className="border-b bg-blue-50/50 sticky top-0 z-10">
        <div className="px-6 py-4 bg-background border-b">
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
        
        {/* Agent-Level Custom Instructions */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-medium text-muted-foreground">
              Agent Instructions & Context
            </div>
            {!editingInstructions && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingInstructions(true)}
                className="h-7 text-xs"
              >
                <Edit3 className="h-3 w-3 mr-1" />
                Edit
              </Button>
            )}
          </div>
          
          {editingInstructions ? (
            <div className="space-y-2">
              <Textarea
                value={instructionsText}
                onChange={(e) => setInstructionsText(e.target.value)}
                placeholder="Add custom instructions or context for this AI agent. These instructions will guide how the agent responds across all data sources and models..."
                className="text-sm min-h-[100px] bg-background"
              />
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelEdit}
                  className="text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveInstructions}
                  className="text-xs"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground bg-background rounded p-3 border">
              {instructionsText || (
                <span className="italic">No agent instructions set. Click Edit to add guidance for this AI agent.</span>
              )}
            </div>
          )}
        </div>

        {aiNarrative && (
          <div className="px-6 pb-4">
            <Card className="border-primary/25 bg-primary/5">
              <div className="flex items-start gap-3 p-4">
                <div className="rounded-md bg-primary/10 p-2 text-primary">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-primary">AI Interpretation</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {aiNarrative}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

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
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <MultiModelTreeView
          key={treeKey}
          models={connectedModels}
          showInstructionBadges={true}
          filterWithInstructions={filterWithInstructions}
          onFilterChange={setFilterWithInstructions}
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

export default function ModelPage() {
  return (
    <Suspense fallback={<div className="h-full flex items-center justify-center">Loading...</div>}>
      <ModelPageContent />
    </Suspense>
  );
}

