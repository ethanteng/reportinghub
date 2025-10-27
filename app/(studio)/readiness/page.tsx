'use client';

import { useState } from 'react';
import { ReadinessRunCard } from '@/components/studio/ReadinessRunCard';
import { FindingList } from '@/components/studio/FindingList';
import { useBiGeniusStore } from '@/store/useBiGeniusStore';
import { runAnalyzer } from '../../../lib/mockServices';
import { toast } from 'sonner';
import { AnalyzerStatus } from '../../../lib/types';

export default function ReadinessPage() {
  const { model, analyzerRun, setAnalyzerRun } = useBiGeniusStore();
  const [progress, setProgress] = useState(0);

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

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b bg-background sticky top-0 z-10">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-semibold">AI Readiness</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Analyze your model for optimal AI query performance
          </p>
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

          {hasFindings && <FindingList findings={analyzerRun.findings || []} />}
        </div>
      </div>
    </div>
  );
}

