'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SummaryCard } from '@/components/studio/SummaryCard';
import { EmptyState } from '@/components/studio/EmptyState';
import { AgentChatWidget } from '@/components/studio/AgentChatWidget';
import { useBiGeniusStore } from '@/store/useBiGeniusStore';
import { toast } from 'sonner';
import {
  Database,
  Network,
  CheckCircle2,
  Brain,
  Copy,
  Rocket,
  ExternalLink,
  ChevronRight,
  Table2,
  Columns,
  Play,
  FileText,
  Tag,
} from 'lucide-react';
import { AgentConfig, AgentStatus } from '../../../lib/types';

export default function PublishPage() {
  const { models, dataSources, getAnalyzerRunForModel, getInstructionCount, addAgentConfig, getCurrentAgent } =
    useBiGeniusStore();
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [showTestChat, setShowTestChat] = useState(false);

  const currentAgent = getCurrentAgent();
  const connectedSources = dataSources.filter((ds) => 
    currentAgent?.sourceIds.includes(ds.id)
  );
  
  // Filter models to only show those from connected sources
  const connectedSourceIds = connectedSources.map(ds => ds.id);
  const connectedModels = models.filter(model => 
    connectedSourceIds.includes(model.sourceId)
  );
  
  const model = connectedModels.find((m) => m.id === currentAgent?.modelId) || connectedModels[0];
  const analyzerRun = getAnalyzerRunForModel(model?.id);
  const readinessScore = analyzerRun?.summary?.readinessScore || 0;
  const instructionCount = getInstructionCount();

  const handleClone = () => {
    if (!currentAgent) return;
    
    // Parse version tag (e.g., "v1" -> 1)
    const versionNum = parseInt(model.versionTag.replace('v', ''), 10);
    const newVersion = `v${versionNum + 1}`;

    const newConfig: AgentConfig = {
      id: `config_${Date.now()}`,
      name: `${currentAgent.name} (Clone)`,
      modelId: model.id,
      versionTag: newVersion,
      status: AgentStatus.Draft, // Clones start as draft
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      clonedFromId: currentAgent.id,
      instructionIds: [...currentAgent.instructionIds],
      sourceIds: [...currentAgent.sourceIds],
    };

    addAgentConfig(newConfig);
    toast.success(`Configuration cloned as ${newVersion}`);
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    toast.loading('Publishing agent...', { id: 'publish' });

    // Simulate publish delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const mockUrl = `https://bi-genius.example.com/agents/${model.id}`;
    setPublishedUrl(mockUrl);
    setIsPublishing(false);

    toast.success('Agent published successfully!', { id: 'publish' });
  };

  const getScoreVariant = (score: number): 'default' | 'success' | 'warning' => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'default';
  };

  // Show empty state if no data sources are connected
  if (connectedSources.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="border-b bg-background sticky top-0 z-10">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-semibold">Publish Agent</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Review your configuration and publish your AI agent
            </p>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            icon={Rocket}
            title="Not Ready to Publish"
            description="Complete the setup by adding data sources, configuring your model, and running readiness analysis before publishing."
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
              <h1 className="text-2xl font-semibold">Publish Agent</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Review your configuration and publish your AI agent
              </p>
            </div>
            <div className="flex gap-2">
              {currentAgent && (
                <Button onClick={() => setShowTestChat(true)} variant="outline" size="lg">
                  <Play className="h-4 w-4 mr-2" />
                  Test Agent
                </Button>
              )}
              <Button
                onClick={handlePublish}
                size="lg"
                disabled={isPublishing}
              >
                <Rocket className="h-4 w-4 mr-2" />
                {isPublishing ? 'Publishing...' : 'Publish Agent'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Summary */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Configuration Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <SummaryCard
                icon={CheckCircle2}
                label="Readiness Score"
                value={readinessScore || 'Not analyzed'}
                variant={readinessScore ? getScoreVariant(readinessScore) : 'default'}
              />
              <SummaryCard
                icon={Brain}
                label="Total Instructions"
                value={instructionCount}
              />
              <SummaryCard
                icon={Database}
                label="Data Sources"
                value={connectedModels.length}
              />
            </div>

            {/* Agent Instructions & Context */}
            {currentAgent?.customInstructions && (
              <div className="bg-muted/30 rounded-lg border p-6 mb-6">
                <h3 className="font-semibold mb-3">Agent Instructions & Context</h3>
                <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {currentAgent.customInstructions}
                </div>
              </div>
            )}

            {/* Instructions Breakdown */}
            {instructionCount > 0 && (
              <div className="bg-muted rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Instruction Breakdown</h3>
                  <span className="text-xs text-muted-foreground ml-auto">
                    Only items with instructions shown
                  </span>
                </div>
                <div className="space-y-6">
                  {connectedModels.map((model) => {
                    const dataSource = dataSources.find((ds) => ds.id === model.sourceId);
                    const modelInstructions = model.instructions || [];
                    const tablesWithInstructions = model.tables.filter(
                      (t) => (t.instructions && t.instructions.length > 0) || 
                             t.description ||
                             (t.synonyms && t.synonyms.length > 0) ||
                             t.columns.some((c) => 
                               (c.instructions && c.instructions.length > 0) ||
                               c.description ||
                               (c.synonyms && c.synonyms.length > 0)
                             )
                    );
                    
                    const totalInstructions = modelInstructions.length + 
                      model.tables.reduce((sum, t) => sum + (t.instructions?.length || 0), 0) +
                      model.tables.reduce((sum, t) => sum + t.columns.reduce((cSum, c) => cSum + (c.instructions?.length || 0), 0), 0);
                    
                    const hasDescriptionsOrSynonyms = model.description || 
                      (model.synonyms && model.synonyms.length > 0) ||
                      model.tables.some((t) => 
                        t.description || 
                        (t.synonyms && t.synonyms.length > 0) ||
                        t.columns.some((c) => c.description || (c.synonyms && c.synonyms.length > 0))
                      );
                    
                    if (totalInstructions === 0 && !hasDescriptionsOrSynonyms) return null;

                    return (
                      <div key={model.id} className="space-y-2">
                        {/* Model Header */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-baseline gap-2">
                            {dataSource?.alias ? (
                              <>
                                <span className="text-sm font-semibold">{dataSource.alias}</span>
                                <span className="text-xs text-muted-foreground">({model.name})</span>
                              </>
                            ) : (
                              <span className="text-sm font-semibold">{dataSource?.name || model.name}</span>
                            )}
                          </div>
                          <div className="ml-auto text-xs text-muted-foreground">
                            {totalInstructions} instruction{totalInstructions !== 1 ? 's' : ''}
                          </div>
                        </div>

                        <div className="space-y-2 bg-background rounded-lg border p-4">
                          {/* Model-level instructions */}
                          {(modelInstructions.length > 0 || model.description || model.synonyms) && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Network className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium">{model.name}</span>
                                {(modelInstructions.length > 0 || model.description || model.synonyms) && (
                                  <Brain className="h-3 w-3 text-blue-600" />
                                )}
                              </div>
                              
                              {/* Description */}
                              {model.description && (
                                <div className="ml-6 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                                  <div className="flex items-start gap-2">
                                    <FileText className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                      <span className="font-semibold">Description: </span>
                                      {model.description}
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {/* Synonyms */}
                              {model.synonyms && model.synonyms.length > 0 && (
                                <div className="ml-6 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                                  <div className="flex items-start gap-2">
                                    <Tag className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                      <span className="font-semibold">Synonyms: </span>
                                      {model.synonyms.join(', ')}
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {/* Regular instructions */}
                              {modelInstructions.map((instruction) => (
                                <div key={instruction.id} className="ml-6 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                                  {instruction.content}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Tables with instructions */}
                          {tablesWithInstructions.map((table) => {
                            const tableInstructions = table.instructions || [];
                            const columnsWithInstructions = table.columns.filter(
                              (c) => (c.instructions && c.instructions.length > 0) ||
                                     c.description ||
                                     (c.synonyms && c.synonyms.length > 0)
                            );

                            return (
                              <div key={table.id} className="ml-6 space-y-2 mt-3">
                                {/* Table name and instructions */}
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Table2 className="h-4 w-4 text-purple-600" />
                                    <span className="text-sm font-medium">{table.name}</span>
                                    {(tableInstructions.length > 0 || table.description || table.synonyms) && (
                                      <Brain className="h-3 w-3 text-purple-600" />
                                    )}
                                  </div>
                                  
                                  {/* Description */}
                                  {table.description && (
                                    <div className="ml-6 p-2 bg-purple-50 border border-purple-200 rounded text-xs">
                                      <div className="flex items-start gap-2">
                                        <FileText className="h-3 w-3 text-purple-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                          <span className="font-semibold">Description: </span>
                                          {table.description}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Synonyms */}
                                  {table.synonyms && table.synonyms.length > 0 && (
                                    <div className="ml-6 p-2 bg-purple-50 border border-purple-200 rounded text-xs">
                                      <div className="flex items-start gap-2">
                                        <Tag className="h-3 w-3 text-purple-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                          <span className="font-semibold">Synonyms: </span>
                                          {table.synonyms.join(', ')}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Regular instructions */}
                                  {tableInstructions.map((instruction) => (
                                    <div key={instruction.id} className="ml-6 p-2 bg-purple-50 border border-purple-200 rounded text-xs">
                                      {instruction.content}
                                    </div>
                                  ))}
                                </div>

                                {/* Columns with instructions */}
                                {columnsWithInstructions.map((column) => {
                                  const columnInstructions = column.instructions || [];
                                  return (
                                    <div key={column.id} className="ml-6 space-y-2">
                                      <div className="flex items-center gap-2">
                                        <Columns className="h-4 w-4 text-green-600" />
                                        <span className="text-sm font-medium">{column.name}</span>
                                        {(columnInstructions.length > 0 || column.description || column.synonyms) && (
                                          <Brain className="h-3 w-3 text-green-600" />
                                        )}
                                      </div>
                                      
                                      {/* Description */}
                                      {column.description && (
                                        <div className="ml-6 p-2 bg-green-50 border border-green-200 rounded text-xs">
                                          <div className="flex items-start gap-2">
                                            <FileText className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                                            <div>
                                              <span className="font-semibold">Description: </span>
                                              {column.description}
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                      
                                      {/* Synonyms */}
                                      {column.synonyms && column.synonyms.length > 0 && (
                                        <div className="ml-6 p-2 bg-green-50 border border-green-200 rounded text-xs">
                                          <div className="flex items-start gap-2">
                                            <Tag className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                                            <div>
                                              <span className="font-semibold">Synonyms: </span>
                                              {column.synonyms.join(', ')}
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                      
                                      {/* Regular instructions */}
                                      {columnInstructions.map((instruction) => (
                                        <div key={instruction.id} className="ml-6 p-2 bg-green-50 border border-green-200 rounded text-xs">
                                          {instruction.content}
                                        </div>
                                      ))}
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {instructionCount === 0 && (
              <div className="bg-muted rounded-lg p-8 text-center">
                <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-semibold text-muted-foreground mb-2">No Instructions Added</h3>
                <p className="text-sm text-muted-foreground">
                  Add instructions in the Model & Instructions step to guide your AI agent.
                </p>
              </div>
            )}
          </div>

          {/* Published URL */}
          {publishedUrl && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900 mb-2">Agent Published!</h3>
                  <p className="text-sm text-green-700 mb-3">
                    Your agent is now live and accessible at:
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-white px-3 py-2 rounded border text-sm font-mono break-all">
                      {publishedUrl}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(publishedUrl);
                        toast.success('URL copied to clipboard');
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <a href={publishedUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
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

