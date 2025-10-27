'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SummaryCard } from '@/components/studio/SummaryCard';
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
} from 'lucide-react';
import { AgentConfig } from '../../../lib/types';

export default function PublishPage() {
  const { models, dataSources, analyzerRun, getInstructionCount, agentConfigs, addAgentConfig } =
    useBiGeniusStore();
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);

  const readinessScore = analyzerRun?.summary?.readinessScore || 0;
  const instructionCount = getInstructionCount();
  const currentConfig = agentConfigs[agentConfigs.length - 1];
  
  // Get the first model for clone functionality (backward compatibility)
  const model = models[0];

  const handleClone = () => {
    // Parse version tag (e.g., "v1" -> 1)
    const versionNum = parseInt(model.versionTag.replace('v', ''), 10);
    const newVersion = `v${versionNum + 1}`;

    const newConfig: AgentConfig = {
      id: `config_${Date.now()}`,
      name: `${currentConfig.name} (Clone)`,
      modelId: model.id,
      versionTag: newVersion,
      createdAt: new Date().toISOString(),
      clonedFromId: currentConfig.id,
      instructionIds: [...currentConfig.instructionIds],
      sourceIds: [...currentConfig.sourceIds],
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

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b bg-background sticky top-0 z-10">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-semibold">Publish Agent</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review your configuration and publish your AI agent
          </p>
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
                value={models.length}
              />
            </div>

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
                  {models.map((model) => {
                    const dataSource = dataSources.find((ds) => ds.id === model.sourceId);
                    const modelInstructions = model.instructions || [];
                    const tablesWithInstructions = model.tables.filter(
                      (t) => (t.instructions && t.instructions.length > 0) || 
                             t.columns.some((c) => c.instructions && c.instructions.length > 0)
                    );
                    
                    const totalInstructions = modelInstructions.length + 
                      model.tables.reduce((sum, t) => sum + (t.instructions?.length || 0), 0) +
                      model.tables.reduce((sum, t) => sum + t.columns.reduce((cSum, c) => cSum + (c.instructions?.length || 0), 0), 0);
                    
                    if (totalInstructions === 0) return null;

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
                          {modelInstructions.length > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Network className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium">{model.name}</span>
                                {modelInstructions.length > 0 && (
                                  <Brain className="h-3 w-3 text-blue-600" />
                                )}
                              </div>
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
                              (c) => c.instructions && c.instructions.length > 0
                            );

                            return (
                              <div key={table.id} className="ml-6 space-y-2 mt-3">
                                {/* Table name and instructions */}
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Table2 className="h-4 w-4 text-purple-600" />
                                    <span className="text-sm font-medium">{table.name}</span>
                                    {tableInstructions.length > 0 && (
                                      <Brain className="h-3 w-3 text-purple-600" />
                                    )}
                                  </div>
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
                                        {columnInstructions.length > 0 && (
                                          <Brain className="h-3 w-3 text-green-600" />
                                        )}
                                      </div>
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

          {/* Agent Details */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Agent Details</h2>
            <div className="bg-muted rounded-lg p-6 space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Agent Name</label>
                <p className="text-base mt-1">{currentConfig.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Configuration ID
                </label>
                <p className="text-base mt-1 font-mono text-sm">{currentConfig.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created</label>
                <p className="text-base mt-1" suppressHydrationWarning>
                  {new Date(currentConfig.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Actions</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleClone} variant="outline" size="lg" className="flex-1">
                <Copy className="h-4 w-4 mr-2" />
                Clone Configuration
              </Button>
              <Button
                onClick={handlePublish}
                size="lg"
                className="flex-1"
                disabled={isPublishing}
              >
                <Rocket className="h-4 w-4 mr-2" />
                {isPublishing ? 'Publishing...' : 'Publish Agent'}
              </Button>
            </div>
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

          {/* Recommendations */}
          {readinessScore > 0 && readinessScore < 80 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="font-semibold text-yellow-900 mb-2">Recommendations</h3>
              <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                <li>Your readiness score is below 80. Consider addressing findings first.</li>
                <li>Review and apply recommendations from the Readiness analysis.</li>
                <li>Add more instructions to improve query accuracy.</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

