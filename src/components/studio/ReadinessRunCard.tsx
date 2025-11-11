'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProgressBar } from './ProgressBar';
import { Play, RefreshCw, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { AnalyzerRun, AnalyzerStatus, ReadinessSeverity } from '../../../lib/types';

interface ReadinessRunCardProps {
  analyzerRun: AnalyzerRun | null;
  onRun: () => void;
  onRescan?: () => void;
}

export function ReadinessRunCard({ analyzerRun, onRun, onRescan }: ReadinessRunCardProps) {
  const isRunning =
    analyzerRun?.status === AnalyzerStatus.Running ||
    analyzerRun?.status === AnalyzerStatus.Queued;

  if (!analyzerRun || analyzerRun.status === AnalyzerStatus.NotRun) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Play className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Run AI Readiness Analysis</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Analyze your semantic model for AI readiness. This will check for common issues
              that may affect query accuracy and provide quick wins.
            </p>
          </div>
          <Button onClick={onRun} size="lg">
            <Play className="h-4 w-4 mr-2" />
            Run Analysis
          </Button>
        </div>
      </Card>
    );
  }

  if (isRunning) {
    const progress = (analyzerRun.progress || 0) * 100;
    const eta = progress > 0 ? `~${Math.ceil((1 - (analyzerRun.progress || 0)) * 10)}s` : '';

    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Analyzing Model...</h3>
            <span className="text-sm text-muted-foreground">
              {analyzerRun.status === AnalyzerStatus.Queued ? 'Queued' : 'Running'}
            </span>
          </div>
          <ProgressBar value={progress} label="Analyzing tables and columns" eta={eta} />
          <p className="text-xs text-muted-foreground">
            This may take a few minutes depending on model complexity.
          </p>
        </div>
      </Card>
    );
  }

  if (analyzerRun.status === AnalyzerStatus.Error) {
    return (
      <Card className="p-6 border-destructive">
        <div className="flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-destructive flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-destructive mb-2">Analysis Failed</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {analyzerRun.errorMessage || 'An error occurred during analysis'}
            </p>
            <Button onClick={onRun} variant="destructive">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Success state - calculate actual finding counts
  const summary = analyzerRun.summary!;
  const score = summary.readinessScore;
  const findings = analyzerRun.findings || [];
  const blockerCount = findings.filter(f => f.severity === ReadinessSeverity.Blocker).length;
  const warningCount = findings.filter(f => f.severity === ReadinessSeverity.Warn).length;
  const infoCount = findings.filter(f => f.severity === ReadinessSeverity.Info).length;
  const totalIssues = findings.length;

  // Score thresholds and colors
  const getScoreInfo = (score: number) => {
    if (score >= 90) return { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', label: 'Excellent' };
    if (score >= 75) return { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', label: 'Good' };
    if (score >= 60) return { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', label: 'Fair' };
    return { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', label: 'Needs Work' };
  };

  const scoreInfo = getScoreInfo(score);

  // Estimate potential score improvement
  const potentialIncrease = blockerCount * 5 + warningCount * 3 + infoCount * 2;
  const potentialScore = Math.min(100, score + potentialIncrease);

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
            <div>
              <h3 className="text-lg font-semibold">Analysis Complete</h3>
              {analyzerRun.finishedAt && (
                <p className="text-sm text-muted-foreground" suppressHydrationWarning>
                  Completed {new Date(analyzerRun.finishedAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>
          {onRescan && (
            <Button onClick={onRescan} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Rescan
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Readiness Score */}
          <div className={`p-6 rounded-lg border ${scoreInfo.bg} ${scoreInfo.border}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-muted-foreground">Readiness Score</div>
              <div className={`text-xs font-semibold px-2 py-1 rounded ${scoreInfo.color} bg-background`}>
                {scoreInfo.label}
              </div>
            </div>
            <div className={`text-5xl font-bold ${scoreInfo.color} mb-2`}>{score}</div>
            <div className="text-xs text-muted-foreground">
              {score >= 90 && "Outstanding! Your model is highly optimized for AI."}
              {score >= 75 && score < 90 && "Strong foundation with room for optimization."}
              {score >= 60 && score < 75 && "Functional but could benefit from improvements."}
              {score < 60 && "Address the findings below to improve AI performance."}
            </div>
          </div>

          {/* Total Findings */}
          <div className="p-6 rounded-lg border bg-muted">
            <div className="text-sm font-medium text-muted-foreground mb-2">Total Findings</div>
            <div className="text-5xl font-bold mb-3">{totalIssues}</div>
            {totalIssues > 0 ? (
              <div className="space-y-1 text-xs text-muted-foreground">
                {blockerCount > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span>{blockerCount} blocker{blockerCount !== 1 ? 's' : ''}</span>
                  </div>
                )}
                {warningCount > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <span>{warningCount} warning{warningCount !== 1 ? 's' : ''}</span>
                  </div>
                )}
                {infoCount > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>{infoCount} quick win{infoCount !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                No quick wins found! 🎉
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

