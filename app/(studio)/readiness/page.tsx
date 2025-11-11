'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ReadinessRunCard } from '@/components/studio/ReadinessRunCard';
import { FindingList } from '@/components/studio/FindingList';
import { EmptyState } from '@/components/studio/EmptyState';
import { AgentChatWidget } from '@/components/studio/AgentChatWidget';
import { useBiGeniusStore } from '@/store/useBiGeniusStore';
import { runAnalyzer } from '../../../lib/mockServices';
import { toast } from 'sonner';
import { AnalyzerStatus, AgentStatus } from '../../../lib/types';
import { CheckCircle2, Database, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function ReadinessPage() {
  const { models, getAnalyzerRunForModel, setAnalyzerRun, dataSources, getCurrentAgent } = useBiGeniusStore();
  const [progress, setProgress] = useState(0);
  const [showTestChat, setShowTestChat] = useState(false);
  
  // Get the current agent config and its associated model
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

  const handleRunAnalysis = async () => {
    try {
      toast.loading('Starting analysis...', { id: 'analyzer' });

      // Initialize a run object for progress tracking
      const tempRun = {
        id: `temp_${Date.now()}` as any,
        modelId: model.id,
        status: AnalyzerStatus.Running,
        startedAt: new Date().toISOString(),
        progress: 0,
      };

      setAnalyzerRun(tempRun);

      const run = await runAnalyzer(model, (p) => {
        setProgress(p * 100);
        setAnalyzerRun({
          ...tempRun,
          progress: p,
          status: AnalyzerStatus.Running,
        });
      });

      setAnalyzerRun(run);
      toast.success(
        `Analysis complete! Readiness score: ${run.summary?.readinessScore || 0}`,
        { id: 'analyzer' }
      );
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Analysis failed', { id: 'analyzer' });
      
      setAnalyzerRun({
        id: `error_${Date.now()}` as any,
        modelId: model.id,
        status: AnalyzerStatus.Error,
        errorMessage: error instanceof Error ? error.message : 'An unexpected error occurred',
        startedAt: new Date().toISOString(),
      });
    }
  };

  const hasFindings =
    analyzerRun?.status === AnalyzerStatus.Success && (analyzerRun.findings?.length || 0) > 0;
  
  const readinessScore = analyzerRun?.summary?.readinessScore || 0;

  // Show empty state if no data sources are connected
  if (connectedSources.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="border-b bg-background sticky top-0 z-10">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-semibold">AI Readiness</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Analyze your model for optimal AI query performance
            </p>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            icon={CheckCircle2}
            title="No Models to Analyze"
            description="Add and sync data sources first to run a readiness analysis on your semantic models."
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
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold">AI Readiness</h1>
                {currentAgent && (
                  <Badge
                    variant={
                      currentAgent.status === AgentStatus.Live ? 'default' : 'secondary'
                    }
                  >
                    {currentAgent.status === AgentStatus.Live ? 'Live' : 'Draft'}
                  </Badge>
                )}
                {currentAgent && (
                  <Badge variant="outline" className="text-xs uppercase">
                    {currentAgent.versionTag}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Validate data quality and modelling choices before promoting your agent.
              </p>
              {currentAgent && (
                <p className="text-xs text-muted-foreground">
                  Reviewing: <span className="font-medium">{currentAgent.name}</span>
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {currentAgent && (
                <Button onClick={() => setShowTestChat(true)} variant="outline">
                  <Play className="h-4 w-4 mr-2" />
                  Test Agent
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <ReadinessRunCard
            analyzerRun={analyzerRun}
            onRun={handleRunAnalysis}
            onRescan={handleRunAnalysis}
          />

          {/* Quick Wins */}
          {readinessScore > 0 && readinessScore < 80 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="font-semibold text-yellow-900 mb-2">Quick Wins</h3>
              <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                <li>Your readiness score is below 80. Consider addressing findings first.</li>
                <li>Review and apply quick wins from the readiness analysis.</li>
                <li>Add more instructions to improve query accuracy.</li>
              </ul>
            </div>
          )}

          {hasFindings && <FindingList findings={analyzerRun.findings || []} />}
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

