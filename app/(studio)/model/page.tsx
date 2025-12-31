'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { MultiModelTreeView } from '@/components/studio/MultiModelTreeView';
import { EmptyState } from '@/components/studio/EmptyState';
import { AgentChatWidget } from '@/components/studio/AgentChatWidget';
import { VersionContext } from '@/components/studio/VersionContext';
import { useBiGeniusStore } from '@/store/useBiGeniusStore';
import { Database, Server, FileText, Globe, Network, Play, Edit3, Check, X, Sparkles, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AgentStatus, DataSourceType, SemanticModel } from '../../../lib/types';
import { toast } from 'sonner';

const iconMap = {
  [DataSourceType.PowerBI]: Database,
  [DataSourceType.SQL]: Server,
  [DataSourceType.File]: FileText,
  [DataSourceType.URL]: Globe,
};

interface SmartSelectViewProps {
  models: SemanticModel[];
  initialExpandedModels?: Set<string>;
  initialExpandedTables?: Set<string>;
}

function SmartSelectView({ models, initialExpandedModels, initialExpandedTables }: SmartSelectViewProps) {
  const { getCurrentAgent, getSmartSelectSummary } = useBiGeniusStore();
  const currentAgent = getCurrentAgent();
  const summary = currentAgent ? getSmartSelectSummary(currentAgent.id) : null;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Explanation Banner */}
      <div className="border-b bg-blue-50/50 px-6 py-3 flex-shrink-0">
        <div className="flex items-start gap-3">
          <Filter className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-blue-900 mb-1">Smart Select</h3>
            <p className="text-sm text-blue-800">
              Smart Select controls what data the AI can use. Smaller models are faster and cheaper.
            </p>
            {summary && (
              <div className="mt-2">
                <Badge variant="secondary" className="text-xs">
                  Smart Select: {summary.includedTables} tables, {summary.includedColumns} columns included
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tree View */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        <MultiModelTreeView
          models={models}
          showInstructionBadges={false}
          filterWithInstructions={false}
          initialExpandedModels={initialExpandedModels}
          initialExpandedTables={initialExpandedTables}
          mode="smart-select"
        />
      </div>
    </div>
  );
}

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
    agentConfigs,
    currentAgentId,
    setCurrentAgentId,
    cloneAgentConfig,
  } = useBiGeniusStore();
  
  // Check for tab query parameter (only smart-select is valid now)
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam === 'smart-select' ? 'smart-select' : 'model');
  
  // Update tab when query param changes
  useEffect(() => {
    if (tabParam === 'smart-select') {
      setActiveTab('smart-select');
    } else {
      setActiveTab('model');
    }
  }, [tabParam]);
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
  const relatedConfigs = primaryModel
    ? agentConfigs.filter((config) => config.modelId === primaryModel.id)
    : agentConfigs;

  // Initialize instructions text when agent loads
  useEffect(() => {
    if (currentAgent) {
      setInstructionsText(currentAgent.customInstructions || '');
    }
  }, [currentAgent]);

  useEffect(() => {
    if (primaryModel && relatedConfigs.length === 1) {
      const singleConfig = relatedConfigs[0];
      if (singleConfig.status !== AgentStatus.Live) {
        updateAgentConfig(singleConfig.id, {
          status: AgentStatus.Live,
          publishedAt: singleConfig.publishedAt ?? new Date().toISOString(),
        });
      }
    }
  }, [primaryModel, relatedConfigs, updateAgentConfig]);

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

  const handleSetPrimary = (configId: string) => {
    if (!primaryModel) return;
    const targetConfig = agentConfigs.find((config) => config.id === configId);
    if (!targetConfig) return;

    relatedConfigs.forEach((config) => {
      if (config.id === configId) {
        updateAgentConfig(config.id, {
          status: AgentStatus.Live,
          publishedAt: new Date().toISOString(),
        });
      } else if (config.status === AgentStatus.Live) {
        updateAgentConfig(config.id, {
          status: AgentStatus.Draft,
          publishedAt: undefined,
        });
      }
    });

    setCurrentAgentId(configId as any);
    toast.success(`${targetConfig.name} set as primary`);
  };

  const handleDuplicate = (configId: string) => {
    const clone = cloneAgentConfig(configId as any);
    toast.success(`Created ${clone.name}`);
  };

  const handleSelectConfig = (configId: string) => {
    setCurrentAgentId(configId as any);
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
      <div className="border-b bg-blue-50/50 sticky top-0 z-10 bg-background">
        <div className="px-6 py-4 bg-background border-b">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-semibold">Semantic Models & Instructions</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Browse model structures, manage instructions, and configure guidance for the AI agent
              </p>
              <div className="mt-3">
                <VersionContext />
              </div>
              {currentAgent && (
                <div className="mt-3 space-y-3">
                  {aiNarrative && (
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
                  )}
                  {connectedSources.length > 0 && (
                    <div>
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
              )}
            </div>
            {currentAgent && (
              <div className="flex items-center gap-2">
                <Button onClick={() => setShowTestChat(true)} variant="outline">
                  <Play className="h-4 w-4 mr-2" />
                  Test Agent
                </Button>
              </div>
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
            <div
              className="text-sm text-muted-foreground bg-background rounded p-3 border cursor-text select-text"
              onClick={() => setEditingInstructions(true)}
            >
              {instructionsText || (
                <span className="italic">No agent instructions set. Click Edit to add guidance for this AI agent.</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0 relative">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden min-h-0">
          <div className="border-b px-6 flex-shrink-0">
            <TabsList className="bg-transparent">
              <TabsTrigger value="model" className="gap-2">
                <Network className="h-4 w-4" />
                Model
              </TabsTrigger>
              <TabsTrigger value="smart-select" className="gap-2">
                <Filter className="h-4 w-4" />
                Smart Select
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="model" className="flex-1 overflow-hidden mt-0 data-[state=active]:flex data-[state=inactive]:hidden flex flex-col min-h-0">
            <MultiModelTreeView
              key={treeKey}
              models={connectedModels}
              showInstructionBadges={true}
              filterWithInstructions={filterWithInstructions}
              onFilterChange={setFilterWithInstructions}
              initialExpandedModels={initialExpandedModels}
              initialExpandedTables={initialExpandedTables}
              mode="browse"
            />
          </TabsContent>

          <TabsContent value="smart-select" className="flex-1 overflow-hidden mt-0 data-[state=active]:flex data-[state=inactive]:hidden flex flex-col min-h-0">
            <SmartSelectView
              models={connectedModels}
              initialExpandedModels={initialExpandedModels}
              initialExpandedTables={initialExpandedTables}
            />
          </TabsContent>
        </Tabs>
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

