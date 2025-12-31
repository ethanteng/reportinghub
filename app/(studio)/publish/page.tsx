'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SummaryCard } from '@/components/studio/SummaryCard';
import { EmptyState } from '@/components/studio/EmptyState';
import { AgentChatWidget } from '@/components/studio/AgentChatWidget';
import { VersionContext } from '@/components/studio/VersionContext';
import { SmartSelectSummary } from '@/components/studio/SmartSelectSummary';
import { useBiGeniusStore } from '@/store/useBiGeniusStore';
import { toast } from 'sonner';
import {
  Database,
  CheckCircle2,
  Brain,
  Table2,
  Columns,
  Play,
  FileText,
  Tag,
  Rocket,
  EyeOff,
  Network,
  Copy,
  ExternalLink,
} from 'lucide-react';
import type {
  SemanticModel,
  Table as SemanticTable,
  Column as SemanticColumn,
} from '../../../lib/types';
import { AgentStatus } from '../../../lib/types';

type HiddenColumnMeta = {
  table: SemanticTable;
  column: SemanticColumn;
};

type VisibilityDetail = {
  model: SemanticModel;
  hiddenTableIds: string[];
  manualHiddenColumnIds: string[];
  hiddenTables: SemanticTable[];
  manuallyHiddenColumns: HiddenColumnMeta[];
  totalTables: number;
  hiddenTablesCount: number;
  visibleTablesCount: number;
  totalColumns: number;
  hiddenColumnsCount: number;
  visibleColumnsCount: number;
  totalInstructions: number;
  visibleInstructions: number;
  hiddenInstructions: number;
};

const getScoreVariant = (score: number): 'default' | 'success' | 'warning' => {
  if (score >= 80) return 'success';
  if (score >= 60) return 'warning';
  return 'default';
};

const formatListPreview = (values: string[]) => {
  if (values.length === 0) return undefined;
  if (values.length <= 3) return values.join(', ');
  return `${values.slice(0, 3).join(', ')} +${values.length - 3} more`;
};

export default function SummaryPage() {
  const { models, dataSources, getAnalyzerRunForModel, getCurrentAgent, agentConfigs, updateAgentConfig, getSmartSelectSummary } =
    useBiGeniusStore();
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [showTestChat, setShowTestChat] = useState(false);

  const currentAgent = getCurrentAgent();

  const connectedSources = useMemo(() => {
    if (!currentAgent) {
      return [];
    }
    return dataSources.filter((ds) => currentAgent.sourceIds.includes(ds.id));
  }, [currentAgent, dataSources]);

  const connectedSourceIds = useMemo(
    () => connectedSources.map((ds) => ds.id),
    [connectedSources]
  );

  const connectedModels = useMemo(() => {
    if (connectedSourceIds.length === 0) {
      return [];
    }
    return models.filter((model) =>
      connectedSourceIds.includes(model.sourceId)
    );
  }, [models, connectedSourceIds]);

  const model = useMemo(() => {
    if (!currentAgent) {
      return undefined;
    }

    return (
      connectedModels.find((m) => m.id === currentAgent.modelId) ??
      connectedModels[0]
    );
  }, [connectedModels, currentAgent]);

  const analyzerRun = useMemo(() => {
    if (!model) {
      return undefined;
    }
    return getAnalyzerRunForModel(model.id);
  }, [getAnalyzerRunForModel, model]);

  const readinessScore = analyzerRun?.summary?.readinessScore ?? 0;
  const readinessScoreDefined =
    analyzerRun?.summary?.readinessScore !== undefined &&
    analyzerRun?.summary?.readinessScore !== null;

  const visibilityDetails = useMemo<VisibilityDetail[]>(() => {
    if (!currentAgent) {
      return [];
    }

    return connectedModels.map((semanticModel) => {
      const overrides = currentAgent.visibilityOverrides?.[semanticModel.id];
      const hiddenTableIds = new Set(overrides?.excludedTableIds ?? []);
      const manualHiddenColumnIds = new Set(
        overrides?.excludedColumnIds ?? []
      );

      const totalTables = semanticModel.tables.length;
      const hiddenTables = semanticModel.tables.filter((table) =>
        hiddenTableIds.has(table.id)
      );
      const visibleTables = semanticModel.tables.filter(
        (table) => !hiddenTableIds.has(table.id)
      );
      const totalColumns = semanticModel.tables.reduce(
        (sum, table) => sum + table.columns.length,
        0
      );
      const hiddenColumnsFromHiddenTables = hiddenTables.reduce(
        (sum, table) => sum + table.columns.length,
        0
      );

      const manuallyHiddenColumns = visibleTables.flatMap((table) =>
        table.columns
          .filter((column) => manualHiddenColumnIds.has(column.id))
          .map((column) => ({ table, column }))
      );

      const hiddenColumnsCount =
        hiddenColumnsFromHiddenTables + manuallyHiddenColumns.length;
      const visibleColumnsCount = totalColumns - hiddenColumnsCount;

      let visibleInstructions = semanticModel.instructions?.length ?? 0;
      let hiddenInstructions = 0;

      semanticModel.tables.forEach((table) => {
        const tableInstructionCount = table.instructions?.length ?? 0;
        const columnInstructionCount = table.columns.reduce(
          (sum, column) => sum + (column.instructions?.length ?? 0),
          0
        );

        if (hiddenTableIds.has(table.id)) {
          hiddenInstructions += tableInstructionCount + columnInstructionCount;
          return;
        }

        visibleInstructions += tableInstructionCount;

        table.columns.forEach((column) => {
          const columnInstructions = column.instructions?.length ?? 0;
          if (manualHiddenColumnIds.has(column.id)) {
            hiddenInstructions += columnInstructions;
          } else {
            visibleInstructions += columnInstructions;
          }
        });
      });

      const totalInstructions = visibleInstructions + hiddenInstructions;

      return {
        model: semanticModel,
        hiddenTableIds: Array.from(hiddenTableIds),
        manualHiddenColumnIds: Array.from(manualHiddenColumnIds),
        hiddenTables,
        manuallyHiddenColumns,
        totalTables,
        hiddenTablesCount: hiddenTables.length,
        visibleTablesCount: totalTables - hiddenTables.length,
        totalColumns,
        hiddenColumnsCount,
        visibleColumnsCount,
        totalInstructions,
        visibleInstructions,
        hiddenInstructions,
      };
    });
  }, [connectedModels, currentAgent]);

  const visibilityTotals = useMemo(() => {
    return visibilityDetails.reduce(
      (acc, detail) => {
        acc.totalTables += detail.totalTables;
        acc.visibleTables += detail.visibleTablesCount;
        acc.hiddenTables += detail.hiddenTablesCount;
        acc.totalColumns += detail.totalColumns;
        acc.visibleColumns += detail.visibleColumnsCount;
        acc.hiddenColumns += detail.hiddenColumnsCount;
        acc.totalInstructions += detail.totalInstructions;
        acc.visibleInstructions += detail.visibleInstructions;
        acc.hiddenInstructions += detail.hiddenInstructions;
        return acc;
      },
      {
        totalTables: 0,
        visibleTables: 0,
        hiddenTables: 0,
        totalColumns: 0,
        visibleColumns: 0,
        hiddenColumns: 0,
        totalInstructions: 0,
        visibleInstructions: 0,
        hiddenInstructions: 0,
      }
    );
  }, [visibilityDetails]);

  const visibilityMap = useMemo(() => {
    const map = new Map<string, VisibilityDetail>();
    visibilityDetails.forEach((detail) => map.set(detail.model.id, detail));
    return map;
  }, [visibilityDetails]);

  const hasHiddenSchema =
    visibilityTotals.hiddenTables > 0 || visibilityTotals.hiddenColumns > 0;
  const hasHiddenInstructions = visibilityTotals.hiddenInstructions > 0;
  const hasInstructions = visibilityTotals.totalInstructions > 0;

  const sourceDescription = formatListPreview(
    connectedSources.map((source) => source.alias || source.name)
  );

  if (!currentAgent) {
    return (
      <div className="h-full flex flex-col">
        <div className="border-b bg-background sticky top-0 z-10">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-semibold">Agent Summary</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Select an agent configuration to review its summary and publish it.
            </p>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            icon={Brain}
            title="No Agent Selected"
            description="Pick an agent from the list or create a new one to access the summary view."
            action={
              <Link href="/agents">
                <Button size="lg">
                  Choose Agent
                </Button>
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  if (connectedSources.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="border-b bg-background sticky top-0 z-10">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-semibold">Agent Summary</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Connect data sources to generate a configuration summary.
            </p>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            icon={Rocket}
            title="No Data Sources Connected"
            description="Add and sync data sources before reviewing the agent summary or publishing."
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

  if (!model) {
    return (
      <div className="h-full flex flex-col">
        <div className="border-b bg-background sticky top-0 z-10">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-semibold">Agent Summary</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Sync a semantic model to review the configuration summary.
            </p>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            icon={Table2}
            title="No Semantic Model Available"
            description="Sync your data sources to generate semantic models before publishing."
            action={
              <Link href="/sources">
                <Button size="lg">
                  <Database className="h-4 w-4 mr-2" />
                  Manage Sources
                </Button>
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  const handlePublish = async () => {
    if (!currentAgent) return;
    
    setIsPublishing(true);
    toast.loading('Publishing agent...', { id: 'publish' });

    // Set this version as Live and mark others as Draft
    const relatedConfigs = agentConfigs.filter((config) => config.modelId === currentAgent.modelId);
    
    relatedConfigs.forEach((config) => {
      if (config.id === currentAgent.id) {
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

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const mockUrl = `https://bi-genius.example.com/agents/${currentAgent.id}`;
    setPublishedUrl(mockUrl);
    setIsPublishing(false);

    toast.success('Version published successfully! This version is now Live.', { id: 'publish' });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="border-b bg-background sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold">Agent Summary</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Review configuration, schema visibility, and AI interpretation
                before publishing.
              </p>
              <div className="mt-3">
                <VersionContext />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowTestChat(true)}
                variant="outline"
                size="lg"
              >
                <Play className="h-4 w-4 mr-2" />
                Test Agent
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Version Summary Card */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Version Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Data Sources</div>
                <div className="text-2xl font-semibold">{connectedSources.length}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Smart Select</div>
                {currentAgent && (() => {
                  const summary = getSmartSelectSummary(currentAgent.id);
                  return summary ? (
                    <div className="text-sm font-semibold">
                      {summary.includedTables} tables, {summary.includedColumns} columns
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">—</div>
                  );
                })()}
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Readiness Score</div>
                <div className="text-2xl font-semibold">{readinessScore}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Instructions</div>
                <div className="text-2xl font-semibold">{visibilityTotals.visibleInstructions}</div>
              </div>
            </div>
            {currentAgent && currentAgent.status === AgentStatus.Live && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-sm font-medium text-green-900">
                  ✓ This version is currently Live
                </div>
              </div>
            )}
            {currentAgent && currentAgent.status !== AgentStatus.Live && (
              <div className="mt-4">
                <Button
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="w-full"
                >
                  <Rocket className="h-4 w-4 mr-2" />
                  {isPublishing ? 'Publishing...' : 'Publish This Version'}
                </Button>
              </div>
            )}
          </Card>

          {currentAgent.customInstructions && (
            <Card className="p-6">
              <h3 className="font-semibold mb-3">Agent Instructions & Context</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {currentAgent.customInstructions}
              </p>
            </Card>
          )}

          <Card className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <Table2 className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Schema Visibility</h3>
              </div>
              {hasHiddenSchema && (
                <span className="text-xs text-muted-foreground">
                  Hiding {visibilityTotals.hiddenTables} table
                  {visibilityTotals.hiddenTables === 1 ? '' : 's'} and{' '}
                  {visibilityTotals.hiddenColumns} column
                  {visibilityTotals.hiddenColumns === 1 ? '' : 's'} from this agent.
                </span>
              )}
            </div>

            <div className="space-y-4">
              {visibilityDetails.map((detail) => {
                const dataSource = dataSources.find(
                  (ds) => ds.id === detail.model.sourceId
                );
                const displayName =
                  dataSource?.alias || dataSource?.name || detail.model.name;
                const hiddenColumnsByTable = detail.manuallyHiddenColumns.reduce<
                  Record<string, number>
                >((acc, item) => {
                  acc[item.table.id] = (acc[item.table.id] ?? 0) + 1;
                  return acc;
                }, {});

                return (
                  <div
                    key={detail.model.id}
                    className="border rounded-lg bg-muted/30 p-4 space-y-3"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold">{displayName}</p>
                        {dataSource?.alias && (
                          <p className="text-xs text-muted-foreground">
                            {detail.model.name}
                          </p>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground md:text-right">
                        {detail.visibleTablesCount}/{detail.totalTables} tables ·{' '}
                        {detail.visibleColumnsCount}/{detail.totalColumns} columns visible
                      </div>
                    </div>

                    {detail.hiddenTablesCount === 0 &&
                    detail.manuallyHiddenColumns.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        All tables and columns are available to this agent.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {detail.hiddenTablesCount > 0 && (
                          <div className="text-xs text-muted-foreground space-y-1">
                            <p className="font-semibold text-foreground">
                              Hidden tables
                            </p>
                            <ul className="space-y-1">
                              {detail.hiddenTables.map((table) => (
                                <li
                                  key={table.id}
                                  className="flex items-center gap-2"
                                >
                                  <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                                  <span>{table.name}</span>
                                  <span className="text-[10px] text-muted-foreground/70">
                                    {table.columns.length} column
                                    {table.columns.length === 1 ? '' : 's'}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {detail.manuallyHiddenColumns.length > 0 && (
                          <div className="text-xs text-muted-foreground space-y-1">
                            <p className="font-semibold text-foreground">
                              Hidden columns
                            </p>
                            <ul className="space-y-1">
                              {detail.manuallyHiddenColumns.map(({ table, column }) => (
                                <li
                                  key={column.id}
                                  className="flex items-center gap-2"
                                >
                                  <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                                  <span>
                                    {table.name}.{column.name}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {Object.values(hiddenColumnsByTable).some((count) => count > 0) &&
                          detail.hiddenTablesCount === 0 && (
                            <p className="text-[11px] text-muted-foreground">
                              Columns marked as hidden will be excluded, even though the
                              parent table remains visible.
                            </p>
                          )}

                        {detail.hiddenInstructions > 0 && (
                          <div className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-3 py-2">
                            {detail.hiddenInstructions} instruction
                            {detail.hiddenInstructions === 1 ? '' : 's'} will be skipped
                            because of these visibility overrides.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {hasInstructions ? (
            <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Instruction Breakdown</h3>
                  <span className="text-xs text-muted-foreground ml-auto">
                  {visibilityTotals.visibleInstructions} visible ·{' '}
                  {visibilityTotals.totalInstructions} total
                  </span>
              </div>

              {hasHiddenInstructions && (
                <div className="mb-4 text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-3 py-2">
                  {visibilityTotals.hiddenInstructions} instruction
                  {visibilityTotals.hiddenInstructions === 1 ? '' : 's'} are hidden
                  because of table or column visibility choices.
                </div>
              )}

                <div className="space-y-6">
                {connectedModels.map((semanticModel) => {
                  const detail = visibilityMap.get(semanticModel.id);
                  if (!detail) return null;

                  const hiddenTableIds = new Set(detail.hiddenTableIds);
                  const manualHiddenColumnIds = new Set(
                    detail.manualHiddenColumnIds
                  );

                  const modelInstructions = semanticModel.instructions ?? [];
                  const hasModelContent =
                    modelInstructions.length > 0 ||
                    Boolean(semanticModel.description) ||
                    Boolean(semanticModel.synonyms?.length);

                  const visibleTables = semanticModel.tables.filter(
                    (table) => !hiddenTableIds.has(table.id)
                  );

                  const tablesWithContent = visibleTables.filter((table) => {
                    const tableHasContent =
                      (table.instructions?.length ?? 0) > 0 ||
                      Boolean(table.description) ||
                      Boolean(table.synonyms?.length);

                    const columnsWithContent = table.columns.some((column) => {
                      if (manualHiddenColumnIds.has(column.id)) return false;
                      return (
                        (column.instructions?.length ?? 0) > 0 ||
                        Boolean(column.description) ||
                        Boolean(column.synonyms?.length)
                      );
                    });

                    return tableHasContent || columnsWithContent;
                  });

                  if (!hasModelContent && tablesWithContent.length === 0) {
                    return null;
                  }

                  const dataSource = dataSources.find(
                    (ds) => ds.id === semanticModel.sourceId
                  );

                    return (
                    <div key={semanticModel.id} className="space-y-2">
                      <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-baseline gap-2">
                          <span className="text-sm font-semibold">
                            {dataSource?.alias ||
                              dataSource?.name ||
                              semanticModel.name}
                          </span>
                          {dataSource?.alias && (
                            <span className="text-xs text-muted-foreground">
                              ({semanticModel.name})
                            </span>
                            )}
                          </div>
                          <div className="ml-auto text-xs text-muted-foreground">
                          {detail.visibleInstructions} visible instruction
                          {detail.visibleInstructions === 1 ? '' : 's'}
                          {detail.hiddenInstructions > 0 &&
                            ` · ${detail.hiddenInstructions} hidden`}
                          </div>
                        </div>

                        <div className="space-y-2 bg-background rounded-lg border p-4">
                        {(hasModelContent && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Network className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium">
                                {semanticModel.name}
                              </span>
                              {(modelInstructions.length > 0 ||
                                semanticModel.description ||
                                semanticModel.synonyms?.length) && (
                                  <Brain className="h-3 w-3 text-blue-600" />
                                )}
                              </div>
                              
                            {semanticModel.description && (
                                <div className="ml-6 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                                  <div className="flex items-start gap-2">
                                    <FileText className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                    <span className="font-semibold">
                                      Description:{' '}
                                    </span>
                                    {semanticModel.description}
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                            {semanticModel.synonyms?.length ? (
                                <div className="ml-6 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                                  <div className="flex items-start gap-2">
                                    <Tag className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                    <span className="font-semibold">
                                      Synonyms:{' '}
                                    </span>
                                    {semanticModel.synonyms.join(', ')}
                                  </div>
                                </div>
                              </div>
                            ) : null}
                              
                              {modelInstructions.map((instruction) => (
                              <div
                                key={instruction.id}
                                className="ml-6 p-2 bg-blue-50 border border-blue-200 rounded text-xs"
                              >
                                  {instruction.content}
                                </div>
                              ))}
                            </div>
                        )) ||
                          null}

                        {tablesWithContent.map((table) => {
                          const tableInstructions = table.instructions ?? [];
                          const visibleColumnsWithContent = table.columns
                            .filter((column) => !manualHiddenColumnIds.has(column.id))
                            .filter(
                              (column) =>
                                (column.instructions?.length ?? 0) > 0 ||
                                Boolean(column.description) ||
                                Boolean(column.synonyms?.length)
                            );

                          const tableHiddenColumns =
                            detail.manuallyHiddenColumns.filter(
                              (hidden) => hidden.table.id === table.id
                            ).length;

                            return (
                              <div key={table.id} className="ml-6 space-y-2 mt-3">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Table2 className="h-4 w-4 text-purple-600" />
                                  <span className="text-sm font-medium">
                                    {table.name}
                                  </span>
                                  {(tableInstructions.length > 0 ||
                                    table.description ||
                                    table.synonyms?.length) && (
                                      <Brain className="h-3 w-3 text-purple-600" />
                                    )}
                                  {tableHiddenColumns > 0 && (
                                    <span className="text-[10px] text-muted-foreground">
                                      {tableHiddenColumns} hidden column
                                      {tableHiddenColumns === 1 ? '' : 's'}
                                    </span>
                                    )}
                                  </div>
                                  
                                  {table.description && (
                                    <div className="ml-6 p-2 bg-purple-50 border border-purple-200 rounded text-xs">
                                      <div className="flex items-start gap-2">
                                        <FileText className="h-3 w-3 text-purple-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                        <span className="font-semibold">
                                          Description:{' '}
                                        </span>
                                          {table.description}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  
                                {table.synonyms?.length ? (
                                    <div className="ml-6 p-2 bg-purple-50 border border-purple-200 rounded text-xs">
                                      <div className="flex items-start gap-2">
                                        <Tag className="h-3 w-3 text-purple-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                        <span className="font-semibold">
                                          Synonyms:{' '}
                                        </span>
                                          {table.synonyms.join(', ')}
                                      </div>
                                    </div>
                                  </div>
                                ) : null}
                                  
                                  {tableInstructions.map((instruction) => (
                                  <div
                                    key={instruction.id}
                                    className="ml-6 p-2 bg-purple-50 border border-purple-200 rounded text-xs"
                                  >
                                      {instruction.content}
                                    </div>
                                  ))}
                                </div>

                              {visibleColumnsWithContent.map((column) => {
                                const columnInstructions = column.instructions ?? [];

                                  return (
                                    <div key={column.id} className="ml-6 space-y-2">
                                      <div className="flex items-center gap-2">
                                        <Columns className="h-4 w-4 text-green-600" />
                                      <span className="text-sm font-medium">
                                        {column.name}
                                      </span>
                                      {(columnInstructions.length > 0 ||
                                        column.description ||
                                        column.synonyms?.length) && (
                                          <Brain className="h-3 w-3 text-green-600" />
                                        )}
                                      </div>
                                      
                                      {column.description && (
                                        <div className="ml-6 p-2 bg-green-50 border border-green-200 rounded text-xs">
                                          <div className="flex items-start gap-2">
                                            <FileText className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                                            <div>
                                            <span className="font-semibold">
                                              Description:{' '}
                                            </span>
                                              {column.description}
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                      
                                    {column.synonyms?.length ? (
                                        <div className="ml-6 p-2 bg-green-50 border border-green-200 rounded text-xs">
                                          <div className="flex items-start gap-2">
                                            <Tag className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                                            <div>
                                            <span className="font-semibold">
                                              Synonyms:{' '}
                                            </span>
                                              {column.synonyms.join(', ')}
                                          </div>
                                        </div>
                                      </div>
                                    ) : null}
                                      
                                      {columnInstructions.map((instruction) => (
                                      <div
                                        key={instruction.id}
                                        className="ml-6 p-2 bg-green-50 border border-green-200 rounded text-xs"
                                      >
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
            </Card>
          ) : (
            <Card className="p-8 text-center">
                <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold text-muted-foreground mb-2">
                No Instructions Added
              </h3>
                <p className="text-sm text-muted-foreground">
                Add instructions in the Model &amp; Instructions step to guide your
                AI agent.
                </p>
            </Card>
            )}

          {publishedUrl && (
            <Card className="bg-green-50 border-green-200">
              <div className="flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900 mb-2">
                    Agent Published!
                  </h3>
                  <p className="text-sm text-green-700 mb-3">
                    Your agent is now live and accessible at:
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <code className="flex-1 bg-white px-3 py-2 rounded border text-sm font-mono break-all">
                      {publishedUrl}
                    </code>
                    <div className="flex items-center gap-2">
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
            </Card>
          )}
        </div>
      </div>

      {showTestChat && (
        <AgentChatWidget
          agent={currentAgent}
          onClose={() => setShowTestChat(false)}
        />
      )}
    </div>
  );
}

