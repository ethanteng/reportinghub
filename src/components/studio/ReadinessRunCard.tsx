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
              that may affect query accuracy and provide recommendations.
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

          {/* Total Findings with Impact */}
          <div className="p-6 rounded-lg border bg-muted">
            {totalIssues > 0 ? (
              <div className="flex gap-6">
                {/* Left side - Finding count and breakdown */}
                <div className="flex-1">
                  <div className="text-sm font-medium text-muted-foreground mb-2">Total Findings</div>
                  <div className="text-5xl font-bold mb-3">{totalIssues}</div>
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
                        <span>{infoCount} recommendation{infoCount !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right side - Point calculation */}
                <div className="flex-shrink-0 pl-6 border-l border-border">
                  <div className="text-xs font-medium text-muted-foreground mb-3">Point Impact</div>
                  <div className="space-y-1 text-xs font-mono">
                    <div className="flex justify-between gap-4 text-muted-foreground">
                      <span>Current:</span>
                      <span className="font-semibold">{score}</span>
                    </div>
                    {blockerCount > 0 && (
                      <div className="flex justify-between gap-4 text-red-600">
                        <span>{blockerCount} × +5</span>
                        <span className="font-semibold">+{blockerCount * 5}</span>
                      </div>
                    )}
                    {warningCount > 0 && (
                      <div className="flex justify-between gap-4 text-yellow-600">
                        <span>{warningCount} × +3</span>
                        <span className="font-semibold">+{warningCount * 3}</span>
                      </div>
                    )}
                    {infoCount > 0 && (
                      <div className="flex justify-between gap-4 text-blue-600">
                        <span>{infoCount} × +2</span>
                        <span className="font-semibold">+{infoCount * 2}</span>
                      </div>
                    )}
                    <div className="border-t border-border pt-1 mt-2">
                      <div className="flex justify-between gap-4">
                        <span className="font-semibold">Potential:</span>
                        <span className="text-lg font-bold text-green-600">{potentialScore}</span>
                      </div>
                      {potentialScore > score && (
                        <div className="text-right text-green-600 font-semibold mt-0.5">
                          +{potentialScore - score} pts
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-2">Total Findings</div>
                <div className="text-5xl font-bold mb-2">{totalIssues}</div>
                <div className="text-xs text-muted-foreground">
                  No issues found! 🎉
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

